"use client";

import { useState } from "react";
import useSwapi from "../app/hooks/useSwapi";
import Image from "next/image"; 

// função para ordenar os dados com base no filtro e direção
const sortData = (data: any[], filter: string, order: 'asc' | 'desc') => {
  return data.sort((a, b) => {
    let valA = a[filter];
    let valB = b[filter];

    // para garantir que valores nulos ou "unknown" não afetem a ordenação
    if (valA === 'unknown' || valA === null || valA === '') valA = -Infinity; // Atribui um valor muito baixo
    if (valB === 'unknown' || valB === null || valB === '') valB = -Infinity;

    // conversão para número quando for um valor que pode ser numérico (como altura ou população)
    if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
    if (typeof valB === 'string' && !isNaN(Number(valB))) valB = Number(valB);

    if (order === 'asc') {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });
};

// função para obter a URL da imagem dos itens
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
    : "https://starwars-visualguide.com/assets/img/placeholder.jpg"; // placeholder para recursos desconhecidos
};

// função para obter o ID a partir da URL
const getIdFromUrl = (url: string | undefined): string => {
  if (!url) return "unknown"; // retorna "unknown" se a URL for inválida
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1] || "unknown"; // retorna o último segmento ou "unknown"
};

// função para formatar números com separadores pt-br
const formatNumber = (value: number, decimals: number = 0): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

// mapeamento de traduções
const translations: { [key: string]: string } = {
  male: "Masculino",
  female: "Feminino",
  unknown: "Desconhecido",
  none: "Nenhum",
  n_a: "N/A", // para valores "N/A"
// traduções para climas
  arid: "Árido",
  temperate: "Temperado",
  tropical: "Tropical",
  frozen: "Congelado",
  murky: "Lamacento",
  windy: "Ventoso",
  hot: "Quente",
  moist: "Úmido",
  frigid: "Frígido",
// traduções para terrenos
  desert: "Deserto",
  deserts: "Desertos",
  jungle: "Selva",
  jungles: "Selvas",
  grasslands: "Campos",
  forests: "Florestas",
  mountains: "Montanhas",
  oceans: "Oceanos",
  lakes: "Lagos",
  rivers: "Rios",
  swamps: "Pântanos",
  swamp: "Pântano",
  tundra: "Tundra",
  caves: "Cavernas",
  caverns: "Carvernas",
  cavernous: "Cavernoso",
  cityscape: "Paisagem Urbana",
  rainforests: "Florestas Tropicais",
  ocean: "Oceano",
  volcanic: "Vulcânico",
  "grassy hills": "Colinas Gramadas",
  scrublands: "Matagais",
  savanna: "Savana",
  savannas: "Savanas",
  canyons: "Cânions",
  sinkholes: "Sumidouro",
  volcanoes: "Vulcões", 
  "lava rivers": "Rios de Lava",
  "fungus forests": "Floresta de Fungos",
  fields: "Campos",
  "rock arches": "Arcos Rochosos",
  hills: "Colinas",
  plains: "Planícies",
  urban:"Urbano", 
  reefs: "Recifes", 
  islands:"Ilhas",
  verdant: "Verdejante",
  rocky: "Rochoso",
  seas: "Mares",
  glaciers: "Geleiras",
  rock: "Pedras",
  mountain: "Montanhas",
  barren: "Árido",
  bogs: "Atoleiro",
  valleys: "Vales",
  grass: "Grama",
  vines: "Videiras",
  cliffs: "Penhascos",
  "rocky deserts": "Desertos Rochosos",
  "toxic cloudsea": "Nuvens Tóxicas",
  "plateaus": "Planaltos",
  "ice caves": "Cavernas de Gelo",
  "mountain ranges": "Serras",
  "ice canyons": "Desfiladeiros de Gelo",
  "gas giant":"Gigante Gasoso",
  "rocky islands": "Ilhas Rochosas",
// traduções para cores
  blue: "Azul",
  green: "Verde",
  brown: "Marrom",
  red: "Vermelho",
  yellow: "Amarelo",
  black: "Preto",
  white: "Branco",
  orange: "Laranja",
  pink: "Rosa",
  gold: "Dourado",
  silver: "Prateado",
  hazel: "Avelã",
  blond: "Loiro", 
  fair: "Clara", 
  light: "Clara",
  grey: "Cinza",
  auburn: "Ruivo",
  amber: "Âmbar",
  dark: "Escura",
  "brown mottle": "Mancha Marrom",
  "green-tan": "Verde Bronzeado",
  "blue-gray": "Azul-Cinza",
  "mottled green": "Verde Manchado",
};

// função para traduzir valores
const translate = (value: string): string => {
  const translatedValue = translations[value.toLowerCase()];
  return translatedValue || "Desconhecido";  // retorna "Desconhecido" caso não haja tradução definida
};

// função para traduzir listas separadas por vírgulas
const translateList = (list: string): string => {
  return list
    .split(",") // divide os itens pela vírgula
    .map((item) => translate(item.trim())) // traduz cada item individualmente
    .join(", "); // funta novamente os itens traduzidos com vírgulas
};

// função para formatar as descrições com base no tipo de recurso
const formatDescription = (resource: string, item: any): string => {
  switch (resource) {
    case "people":
      return `Altura: ${formatNumber(Number(item.height) / 100, 2)} m
      Peso: ${item.mass !== "unknown" ? `${item.mass} kg` : "Desconhecido"}
      Gênero: ${translate(item.gender || "Desconhecido")}
      Data de Aniversário: ${item.birth_year || "Desconhecido"}
      Cor dos Olhos: ${translateList(item.eye_color || "Desconhecido")}
      Cor do Cabelo: ${translateList(item.hair_color || "Desconhecido")}
      Cor da Pele: ${translateList(item.skin_color || "Desconhecido")}
      Filmes: ${item.films?.length || 0}`;
    case "films":
      return `Diretor: ${item.director || "N/A"}
      Produtor: ${item.producer || "N/A"}
      Data de Lançamento: ${item.release_date || "N/A"}
      Abertura: "${item.opening_crawl ? item.opening_crawl.replace(/\n/g, ' ') : "N/A"}"`;
    case "planets":
      return `Clima: ${translateList(item.climate || "N/A")}
      Terreno: ${translateList(item.terrain || "N/A")}
      Diâmetro: ${formatNumber(Number(item.diameter))} km
      População: ${
        item.population !== "unknown"
          ? formatNumber(Number(item.population))
          : "Desconhecida"
      }`;
    case "species":
      return `Altura média: ${formatNumber(Number(item.average_height) / 100, 2)} m
      Cores dos cabelos: ${translateList(item.hair_colors || "N/A")}
      Cores dos olhos: ${translateList(item.eye_colors || "N/A")}
      Linguagem: ${item.language || "N/A"}`;
    case "vehicles":
      return `Modelo: ${item.model || "N/A"}
      Fábrica: ${item.manufacturer || "N/A"}
      Valor: ${
        item.cost_in_credits !== "unknown"
          ? `${formatNumber(Number(item.cost_in_credits))}`
          : "Desconhecido"
      }
      Velocidade Máxima: ${
        item.max_atmosphering_speed !== "unknown"
          ? `${formatNumber(Number(item.max_atmosphering_speed))} km/h`
          : "Desconhecida"
      }
      Capacidade de Passageiros: ${item.passengers !== "unknown" ? formatNumber(Number(item.passengers)) : "Desconhecida"
      }
      Capacidade de Carga: ${item.cargo_capacity !== "unknown" ? `${formatNumber(Number(item.cargo_capacity))} kg` : "Desconhecida"
      }
      `;
    case "starships":
      return `Modelo: ${item.model || "N/A"}
      Fábrica: ${item.manufacturer || "N/A"}
      Valor: ${
        item.cost_in_credits !== "unknown"
          ? `${formatNumber(Number(item.cost_in_credits))}`
          : "Desconhecido"
      }
      Cap. de Passageiros: ${
        item.passengers !== "unknown"
          ? formatNumber(Number(item.passengers))
          : "Desconhecida"
      }
      Cap. de Carga: ${
        item.cargo_capacity !== "unknown"
          ? `${formatNumber(Number(item.cargo_capacity))} kg`
          : "Desconhecida"
      }`;
    default:
      return "Descrição não disponível.";
  }
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [resource, setResource] = useState<string>("people");

  const [filter, setFilter] = useState<string>(''); // estado para o filtro de ordenação
  const [order, setOrder] = useState<'asc' | 'desc'>('asc'); // estado para a direção da ordenação

  const { data, loading, error } = useSwapi(resource, searchTerm);

  // função para ordenar os dados com base no filtro e ordem
  const sortedData = data ? sortData(data.results, filter, order) : [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleResourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setResource(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value); // define o filtro selecionado
  };

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(event.target.value as 'asc' | 'desc'); // define a ordem de exibição (crescente ou decrescente)
  };

  // mostrar filtros apenas quando o usuário digitar algo
  const showFilters = searchTerm.trim() !== "";
  return (
    <div className="container"> {/* container que engloba todas as divs */}
      <div className="logo"> {/* logo da aplicação */}
        <Image
          src="/logo.png" 
          alt="Logo do Star Wars"
          width={250} 
          height={120} 
          priority 
        />
      </div>

      <div className="buscar"> {/* div com o buscador e filtro */}
        <input
          type="text"
          placeholder={`Buscar`}
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <select onChange={handleResourceChange} value={resource}>
          <option value="people">Personagens</option>
          <option value="films">Filmes</option>
          <option value="planets">Planetas</option>
          <option value="starships">Naves</option>
          <option value="vehicles">Veículos</option>
          <option value="species">Espécies</option>
        </select>
      </div>

        {/* Filtros */}

        {showFilters && ( 
          <div className="filtros">
            <div className="box-filtros">
            {resource === "people" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="gender">Gênero</option>
            </select>
          )}
          {resource === "films" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="release_date">Data</option>
            </select>
          )}
          {resource === "planets" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="population">População</option>
            </select>
          )}
          {resource === "species" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="average_height">Altura Média</option>
            </select>
          )}
          {resource === "vehicles" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="max_atmosphering_speed">Velocidade</option>
            </select>
          )}
          {resource === "starships" && (
            <select onChange={handleFilterChange} value={filter}>
              <option value="">Filtro</option>
              <option value="cargo_capacity">Cap. de Carga</option>
            </select>
          )}
          
          {filter && (
            <select onChange={handleOrderChange} value={order}>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          )}
            </div>
          </div>

        )}
<div className="resultados">
        {loading ? (
          <div className="loading-box">
            <p>Carregando...</p>
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : searchTerm && data ? (
          <div>
            {data.results
              .filter((item) => {
                // caso necessário pode add filtragens por aqui
                return true;
              })
              .sort((a, b) => {
                let valA = a[filter];
                let valB = b[filter];

                // para garantir que valores nulos ou "unknown" não afetem a ordenação
                if (valA === 'unknown' || valA === null || valA === '') valA = -Infinity;
                if (valB === 'unknown' || valB === null || valB === '') valB = -Infinity;

                if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
                if (typeof valB === 'string' && !isNaN(Number(valB))) valB = Number(valB);

                if (order === 'asc') {
                  return valA > valB ? 1 : valA < valB ? -1 : 0;
                } else {
                  return valA < valB ? 1 : valA > valB ? -1 : 0;
                }
              })
              .map((item, index) => {
                const id = getIdFromUrl(item.url);
                const imageUrl = getImageUrl(resource, id);
                const description = formatDescription(resource, item);
                return (
                  <div
                    className="item-resultados"
                    key={index}
                    style={{ marginBottom: "20px" }}
                  >
                    <h2>{item.name || item.title}</h2>
                    <div className="img-descricao">
                      <img
                        src={imageUrl}
                        alt={item.name || item.title}
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                      <p style={{ whiteSpace: "pre-line" }}>{description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Home;