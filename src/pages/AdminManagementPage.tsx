import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import UserManagement from "../components/UserManagement";
import GroupManagement from "../components/GroupManagement";
import ChallengeManagement from "../components/ChallengeManagement";

export default function AdminManagementPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <SectionTitle
        eyebrow="Gestão"
        title="Cadastros da API Java"
        description="Cadastre e edite usuários e desafios, consulte os grupos e acompanhe as confirmações do servidor."
      />
      <Link
        to="/acesso-funcionario"
        className="mb-6 inline-flex font-semibold text-leaf hover:underline"
      >
        Voltar às ferramentas de funcionários
      </Link>
      <nav
        aria-label="Seções da gestão"
        className="mb-10 flex flex-wrap gap-4 text-leaf"
      >
        <a href="#usuarios" className="hover:underline">
          Usuários
        </a>
        <a href="#grupos" className="hover:underline">
          Grupos
        </a>
        <a href="#desafios" className="hover:underline">
          Desafios
        </a>
      </nav>
      <div className="space-y-12">
        <UserManagement />
        <GroupManagement />
        <ChallengeManagement />
      </div>
    </div>
  );
}
