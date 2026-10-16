import "./App.css";

const MOVIES = [
  {
    title: "A Origem",
    tags: ["ficção científica", "ação", "suspense"],
    synopsis:
      "Um especialista em invadir sonhos recebe a missão de plantar uma ideia na mente de um empresário.",
  },
  {
    title: "Interestelar",
    tags: ["ficção científica", "aventura", "drama"],
    synopsis:
      "Um grupo de astronautas atravessa um buraco de minhoca em busca de um planeta habitável para a humanidade.",
  },
  {
    title: "O Poderoso Chefão",
    tags: ["crime", "drama", "máfia"],
    synopsis:
      "O filho de um chefe da máfia se envolve nos negócios da família e assume uma posição de poder.",
  },
  {
    title: "Cidade de Deus",
    tags: ["crime", "drama", "cinema brasileiro"],
    synopsis:
      "Um jovem apaixonado por fotografia acompanha o crescimento do crime organizado na comunidade onde vive.",
  },
  {
    title: "A Viagem de Chihiro",
    tags: ["animação", "fantasia", "aventura"],
    synopsis:
      "Uma menina entra em um mundo de espíritos e precisa trabalhar em uma casa de banhos para salvar seus pais.",
  },
  {
    title: "Parasita",
    tags: ["suspense", "drama", "crítica social"],
    synopsis:
      "Uma família em dificuldades financeiras consegue empregos na casa de uma família rica, escondendo seus laços de parentesco.",
  },
  {
    title: "Matrix",
    tags: ["ficção científica", "ação", "distopia"],
    synopsis:
      "Um programador descobre que sua realidade é uma simulação e se junta à resistência contra as máquinas.",
  },
  {
    title: "O Show de Truman",
    tags: ["drama", "comédia", "sátira"],
    synopsis:
      "Um homem começa a suspeitar que sua vida inteira faz parte de um programa de televisão.",
  },
  {
    title: "Procurando Nemo",
    tags: ["animação", "aventura", "família"],
    synopsis:
      "Um peixe-palhaço atravessa o oceano com uma companheira esquecida para encontrar seu filho capturado por um mergulhador.",
  },
  {
    title: "De Volta para o Futuro",
    tags: ["ficção científica", "comédia", "aventura"],
    synopsis:
      "Um adolescente viaja ao passado por acidente e precisa garantir que seus pais se apaixonem para preservar sua existência.",
  },
];

function MovieCard({
  title,
  tags,
  synopsis,
}: {
  title: string;
  tags: string[];
  synopsis: string;
}) {
  return (
    <div className="movie-card">
      <h2>{title}</h2>
      <div className="tags">
        {tags.map((tag) => (
          <MovieTag tag={tag} />
        ))}
      </div>
      <p>{synopsis}</p>
    </div>
  );
}

function MovieTag({ tag }: { tag: string }) {
  return <div className="tag">{tag}</div>;
}

function App() {
  return (
    <div className="page-container">
      <h1>Movie Recommender</h1>
      <form className="query-form">
        <textarea placeholder="type here your query to search for simmilar movies" />
        <button>Submit</button>
      </form>
      <div className="recommended-movies">
        {MOVIES.map((movie) => (
          <MovieCard {...movie} />
        ))}
      </div>
    </div>
  );
}

export default App;
