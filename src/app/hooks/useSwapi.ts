import { useState, useEffect } from 'react';

interface SwapiData {
  results: any[]; // resultados da pesquisa
  next: string | null; // link para a próxima página (ou nulo)
  previous: string | null; // link para a página anterior (ou nulo)
}

interface FetchResponse {
  results: any[];
  next: string | null;
  previous: string | null;
}

const useSwapi = (resource: string, searchTerm: string) => {
  const [data, setData] = useState<SwapiData | null>(null); // estado para os dados da API
  const [loading, setLoading] = useState<boolean>(false); // estado para carregamento
  const [error, setError] = useState<string | null>(null); // estado para erros

  // função para buscar os dados da SWAPI
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://swapi.dev/api/${resource}/?search=${searchTerm}`);
      const data: FetchResponse = await response.json();

      // adaptar os dados para o tipo SwapiData
      const swapiData: SwapiData = {
        next: data.next,
        previous: data.previous,
        results: data.results,
      };

      // atualiza o estado com os dados obtidos
      setData(swapiData);
    } catch (err) {
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  // hook useEffect para disparar a requisição toda vez que o resource ou searchTerm mudarem
  useEffect(() => {
    if (searchTerm) {
      fetchData();
    }
  }, [searchTerm, resource]); // dependências para disparar quando searchTerm ou resource mudarem

  // função para obter a URL da imagem com base no ID
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

  // retorna os dados, loading, error e a função de obter a URL da imagem
  return { data, loading, error, getImageUrl };
};

export default useSwapi;
