import requests
from typing import Any, Dict, List, Optional

WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql'


def query_wikidata(sparql: str) -> Dict[str, Any]:
    params = {'query': sparql, 'format': 'json'}
    headers = {'Accept': 'application/sparql-results+json'}
    response = requests.get(WIKIDATA_ENDPOINT, params=params, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()


def escape_sparql(text: str) -> str:
    return text.replace('\\', '\\\\').replace('"', '\\"')

def search_distros(term: str) -> List[Dict[str, Any]]:
    if not term or len(term) < 2:
        return []
    query = f"""
    SELECT DISTINCT ?item ?itemLabel ?description WHERE {{
      SERVICE wikibase:mwapi {{
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "{escape_sparql(term)}" .
        bd:serviceParam mwapi:language "en" .
        ?item wikibase:apiOutputItem mwapi:item .
      }}
      ?item wdt:P31/wdt:P279* wd:Q131669 .
      ?item rdfs:label ?itemLabel . 
      FILTER(LANG(?itemLabel) = "en")
      OPTIONAL {{ 
        ?item schema:description ?description . FILTER(LANG(?description) = "en") 
      }}
    }} LIMIT 10
    """
    try:
        data = query_wikidata(query)
        return [{
            'uri': b['item']['value'],
            'name': b['itemLabel']['value'],
            'description': b.get('description', {}).get('value')
        } for b in data.get('results', {}).get('bindings', [])]
    except:
        return []


def get_distro_details(uri: str) -> Optional[Dict[str, Any]]:
    query = f"""
    SELECT ?name ?logo ?website ?packageManagerLabel ?basedOn ?basedOnLabel WHERE {{
      BIND(<{uri}> AS ?item)
      ?item rdfs:label ?name . FILTER(LANG(?name) = "en")
      OPTIONAL {{ ?item wdt:P154 ?logo . }}
      OPTIONAL {{ ?item wdt:P856 ?website . }}
      OPTIONAL {{ 
        ?item wdt:P3033 ?packageManager . 
        ?packageManager rdfs:label ?packageManagerLabel . 
        FILTER(LANG(?packageManagerLabel) = "en") 
      }}
      OPTIONAL {{ 
        ?item wdt:P144 ?basedOn . 
        ?basedOn rdfs:label ?basedOnLabel .
        FILTER(LANG(?basedOnLabel) = "en") 
      }}
    }}
    """
    try:
        data = query_wikidata(query)
        bindings = data.get('results', {}).get('bindings', [])
        if not bindings:
            return None
        
        first = bindings[0]
        based_on_map = {}
        for b in bindings:
            if 'basedOn' in b and 'basedOnLabel' in b:
                based_on_map[b['basedOn']['value']] = {
                    'name': b['basedOnLabel']['value'],
                    'uri': b['basedOn']['value']
                }
        
        result = {
            'uri': uri,
            'name': first['name']['value'],
            'basedOn': list(based_on_map.values()),
            'description': ''
        }
        for key in ['logo', 'website', 'packageManagerLabel']:
            if key in first:
                result_key = 'packageManager' if key == 'packageManagerLabel' else key
                result[result_key] = first[key]['value']
        return result
    except:
        return None


def get_genealogy_graph(center_uri: Optional[str] = None) -> Dict[str, Any]:
    if center_uri:
        query = f"""
        SELECT DISTINCT ?item ?itemLabel ?parent ?parentLabel ?logo WHERE {{
          {{ BIND(<{center_uri}> AS ?focus)
            {{ ?item wdt:P144 ?focus . BIND(?focus AS ?parent) }}
            UNION {{ ?focus wdt:P144 ?parent . BIND(?focus AS ?item) }}
            UNION {{ ?focus wdt:P144 ?common . ?item wdt:P144 ?common . BIND(?common AS ?parent) }}
          }}
          ?item wdt:P31/wdt:P279* wd:Q131669 .
          ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
          ?parent rdfs:label ?parentLabel . FILTER(LANG(?parentLabel) = "en")
          OPTIONAL {{ ?item wdt:P154 ?logo . }}
        }} LIMIT 100
        """
    else:
        query = """
        SELECT DISTINCT ?item ?itemLabel ?parent ?parentLabel ?logo WHERE {
          VALUES ?parent { wd:Q7719 wd:Q186986 wd:Q54100 wd:Q22671 wd:Q94 wd:Q170666 }
          ?item wdt:P144 ?parent .
          ?item wdt:P31/wdt:P279* wd:Q131669 .
          ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en")
          ?parent rdfs:label ?parentLabel . FILTER(LANG(?parentLabel) = "en")
          OPTIONAL { ?item wdt:P154 ?logo . }
        } LIMIT 150
        """
    
    try:
        data = query_wikidata(query)
        nodes_map, links = {}, []
        direct_parents = {b['parent']['value'] for b in data.get('results', {}).get('bindings', []) if center_uri and b['item']['value'] == center_uri}
        
        def get_attrs(nid):
            if center_uri:
                return {'color': '#3b82f6', 'val': 3} if nid == center_uri else ({'color': '#22c55e', 'val': 2} if nid in direct_parents else {'color': '#64748b', 'val': 1})
            return {'color': '#64748b', 'val': 1}
        
        for binding in data.get('results', {}).get('bindings', []):
            parent_id, item_id = binding['parent']['value'], binding['item']['value']
            
            if parent_id not in nodes_map:
                attrs = get_attrs(parent_id)
                if not center_uri and any(root in parent_id for root in ['Q7719', 'Q186986', 'Q54100', 'Q22671', 'Q94', 'Q170666']):
                    attrs = {'color': '#3b82f6', 'val': 2}
                nodes_map[parent_id] = {'id': parent_id, 'name': binding['parentLabel']['value'], 'val': attrs['val'], 'color': attrs['color']}
            
            if item_id not in nodes_map:
                attrs = get_attrs(item_id)
                node = {'id': item_id, 'name': binding['itemLabel']['value'], 'val': attrs['val'], 'color': attrs['color']}
                if 'logo' in binding:
                    node['logo'] = binding['logo']['value']
                nodes_map[item_id] = node
            
            links.append({'source': parent_id, 'target': item_id})
        
        return {'nodes': list(nodes_map.values()), 'links': links}
    except:
        return {'nodes': [], 'links': []}
