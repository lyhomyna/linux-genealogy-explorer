from flask import Flask, jsonify, request
from flask_cors import CORS
from services.sparql_service import search_distros, get_distro_details, get_genealogy_graph

app = Flask(__name__)
CORS(app)


@app.route('/api/search', methods=['GET'])
def search():
    term = request.args.get('term', '').strip()
    if not term or len(term) < 2:
        return jsonify([])
    try:
        return jsonify(search_distros(term))
    except:
        return jsonify({"error": "Search failed"}), 500


@app.route('/api/distro-details', methods=['GET'])
def distro_details():
    uri = request.args.get('uri', '').strip()
    if not uri:
        return jsonify({"error": "URI required"}), 400
    try:
        details = get_distro_details(uri)
        return (jsonify(details), 200) if details else (jsonify({"error": "Not found"}), 404)
    except:
        return jsonify({"error": "Failed"}), 500


@app.route('/api/genealogy-graph', methods=['GET'])
def genealogy_graph():
    center_uri = request.args.get('centerUri', '').strip() or None
    try:
        return jsonify(get_genealogy_graph(center_uri))
    except:
        return jsonify({"error": "Failed"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
