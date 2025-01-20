import { useState, useEffect } from 'react';

// Interface para tipar os dados da resposta da API
interface SwapiData {
  results: any[]; // Resultados da pesquisa
  next: string | null; // Link para a próxima página (pode ser nulo)
  previous: string | null; // Link para a página anterior (pode ser nulo)
}

interface FetchResponse {
  results: any[];
  next: string | null;
  previous: string | null;
}

const useSwapi = (resource: string, searchTerm: string) => {
  const [data, setData] = useState<SwapiData | null>(null); // Estado para os dados da API
  const [loading, setLoading] = useState<boolean>(false); // Estado para carregamento
  const [error, setError] = useState<string | null>(null); // Estado para erros

  // Função para buscar os dados da SWAPI
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://swapi.dev/api/${resource}/?search=${searchTerm}`);
      const data: FetchResponse = await response.json();

      // Adaptar os dados para o tipo SwapiData
      const swapiData: SwapiData = {
        next: data.next,
        previous: data.previous,
        results: data.results,
      };

      // Atualiza o estado com os dados obtidos
      setData(swapiData);
    } catch (err) {
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  // Hook useEffect para disparar a requisição toda vez que o resource ou searchTerm mudarem
  useEffect(() => {
    if (searchTerm) {
      fetchData();
    }
  }, [searchTerm, resource]); // Dependências para disparar quando searchTerm ou resource mudarem

  // Função para obter a URL da imagem com base no ID
  const getImageUrl = (resource: string, id: string): string => {
    const resourceMap: { [key: string]: string } = {
      people: "characters",
      planets: "planets",
      films: "films",
      starships: "starships",
      vehicles: "vehicles",
      species: "species",
    };

    const mappedResource = resourceMap[resource];
    return mappedResource
      ? `https://starwars-visualguide.com/assets/img/${mappedResource}/${id}.jpg`
      : "https://starwars-visualguide.com/assets/img/placeholder.jpg";
  };

  // Retorna os dados, loading, error e a função de obter a URL da imagem
  return { data, loading, error, getImageUrl };
};

export default useSwapi;
