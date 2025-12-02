import { DistroDetails, GraphData, SearchResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Search for a Linux distribution by name
 */
export const searchDistros = async (term: string): Promise<SearchResult[]> => {
  if (!term || term.length < 2) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Search failed", error);
    return [];
  }
};

/**
 * Get detailed information for a specific distribution
 */
export const getDistroDetails = async (uri: string): Promise<DistroDetails | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/distro-details?uri=${encodeURIComponent(uri)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch distro details", error);
    return null;
  }
};

/**
 * Get the genealogy graph
 * If centerUri is provided, gets neighbors. Otherwise, gets major families.
 */
export const getGenealogyGraph = async (centerUri?: string): Promise<GraphData> => {
  try {
    let url = `${API_BASE_URL}/genealogy-graph`;
    if (centerUri) {
      url += `?centerUri=${encodeURIComponent(centerUri)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch graph: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch graph data", error);
    return { nodes: [], links: [] };
  }
};