"use client";

import { useState } from "react";
import Link from "next/link";
import { NICHE_CONFIG } from "@/lib/niche-config";
import { phoneInputMask } from "@/lib/whatsapp-utils";
import type { BusinessFormData } from "@/types";

const NICHE_CARDS = [
  { value: "barbearia",        label: "Barbearia",              sub: "Cortes, barba, acabamento" },
  { value: "salao-beleza",     label: "Salão de Beleza",        sub: "Coloração, escova, manicure" },
  { value: "estetica",         label: "Estética",               sub: "Pele, sobrancelha, depilação" },
  { value: "odontologia",      label: "Odontologia",            sub: "Limpeza, clareamento, implante" },
  { value: "clinica-medica",   label: "Clínica Médica",         sub: "Consultas, exames, saúde" },
  { value: "fisioterapia",     label: "Fisioterapia / Pilates", sub: "Reabilitação, dor, postura" },
  { value: "nutricao",         label: "Nutrição",               sub: "Emagrecimento, plano alimentar" },
  { value: "psicologia",       label: "Psicologia",             sub: "Terapia, saúde mental" },
  { value: "personal-trainer", label: "Personal Trainer",       sub: "Treinos, academia, hipertrofia" },
  { value: "coaching",         label: "Coaching / Mentoria",    sub: "Desenvolvimento, carreira, negócios" },
  { value: "otica",            label: "Ótica",                  sub: "Óculos, lentes, exame de vista" },
  { value: "pet-shop",         label: "Pet Shop / Vet",         sub: "Banho, tosa, consulta, vacina" },
  { value: "restaurante",      label: "Restaurante / Café",     sub: "Comida, delivery, lanches" },
  { value: "confeitaria",      label: "Confeitaria / Padaria",  sub: "Bolos, doces, encomendas" },
  { value: "loja-roupa",       label: "Loja de Roupa",          sub: "Moda, acessórios, looks" },
  { value: "fotografia",       label: "Fotografia / Filmagem",  sub: "Ensaios, casamentos, eventos" },
  { value: "imobiliaria",      label: "Imobiliária",            sub: "Venda, aluguel, corretagem" },
  { value: "construcao",       label: "Construção / Reforma",   sub: "Obra, pintura, acabamento" },
  { value: "mecanica",         label: "Mecânica",               sub: "Revisão, manutenção, funilaria" },
  { value: "serralheria",      label: "Serralheria",            sub: "Portões, grades, estruturas" },
  { value: "advogacia",        label: "Advocacia",              sub: "Jurídico, consultoria, causas" },
  { value: "contabilidade",    label: "Contabilidade",          sub: "Fiscal, imposto, empresas" },
  { value: "escola-cursos",    label: "Escola / Cursos",        sub: "Aulas, turmas, certificação" },
  { value: "tatuagem",         label: "Tatuagem / Piercing",    sub: "Arte corporal, estúdio" },
  { value: "outro",            label: "Outro negócio",          sub: "Descreva o que você faz" },
];

const TONE_OPTIONS = [
  { value: "informal",       label: "Próximo e informal",     desc: "\"A gente te ajuda!\" — como um amigo que entende do assunto" },
  { value: "profissional",   label: "Profissional e sério",   desc: "\"Nossa equipe está à disposição\" — transmite credibilidade" },
  { value: "inspirador",     label: "Motivador e inspirador", desc: "\"Você merece o melhor\" — emociona e engaja" },
  { value: "direto",         label: "Direto ao ponto",        desc: "\"Resultado em 30 dias\" — objetivo, sem rodeios" },
];

const GOALS = [
  { id: "novos_clientes", label: "Atrair novos clientes" },
  { id: "whatsapp",       label: "Vender mais pelo WhatsApp" },
  { id: "instagram",      label: "Crescer no Instagram" },
  { id: "fidelizar",      label: "Fidelizar quem já comprou" },
  { id: "autoridade",     label: "Criar autoridade no nicho" },
  { id: "promocoes",      label: "Divulgar promoções" },
  { id: "avaliacoes",     label: "Ganhar mais avaliações" },
  { id: "online",         label: "Vender online" },
];

const NICHE_HINTS: Record<string, {
  servicesPlaceholder: string;
  differentiatorPlaceholder: string;
  taglinePlaceholder: string;
  audiencePlaceholder: string;
  painPlaceholder: string;
}> = {
  "barbearia": {
    servicesPlaceholder: "Ex: Corte infantil, Barba, Pigmentação, Hot towel...",
    differentiatorPlaceholder: "Ex: Atendimento com hora marcada, sem espera. Ambiente masculino com TV e bebida durante o serviço...",
    taglinePlaceholder: "Ex: Onde o estilo encontra o respeito",
    audiencePlaceholder: "Ex: Homens de 18 a 40 anos que se preocupam com aparência e autoestima. Trabalham no mercado formal, têm orgulho do próprio estilo e buscam atendimento de qualidade...",
    painPlaceholder: "Ex: Cansado de esperar horas na barbearia sem hora marcada, ou sair com um corte que não ficou como queria...",
  },
  "salao-beleza": {
    servicesPlaceholder: "Ex: Coloração, Progressiva, Escova, Manicure, Pedicure...",
    differentiatorPlaceholder: "Ex: Produtos veganos e sem amônia, ambiente aconchegante com agendamento online e sem fila...",
    taglinePlaceholder: "Ex: Realçando a sua beleza natural",
    audiencePlaceholder: "Ex: Mulheres de 25 a 55 anos que cuidam da aparência e valorizam um salão de confiança onde saem satisfeitas sempre...",
    painPlaceholder: "Ex: Cabelo danificado por químicas ruins, dificuldade de encontrar um profissional que entenda o tipo de cabelo dela...",
  },
  "estetica": {
    servicesPlaceholder: "Ex: Limpeza de pele, Sobrancelha, Depilação, Massagem, Drenagem...",
    differentiatorPlaceholder: "Ex: Atendimento humanizado com hora marcada. Usamos produtos importados e o resultado dura 3x mais que a média...",
    taglinePlaceholder: "Ex: Cuidado que transforma",
    audiencePlaceholder: "Ex: Mulheres de 25 a 45 anos que investem em autocuidado e querem se sentir mais bonitas e confiantes no dia a dia...",
    painPlaceholder: "Ex: Pele com manchas, oleosidade ou cravos que ela não consegue tratar em casa. Busca resultado visível, não só relaxamento...",
  },
  "odontologia": {
    servicesPlaceholder: "Ex: Clareamento, Limpeza, Implante, Invisalign, Restauração...",
    differentiatorPlaceholder: "Ex: Consultório com tecnologia digital, sem dor, com sedação consciente para pacientes ansiosos...",
    taglinePlaceholder: "Ex: Sorrisos que transformam vidas",
    audiencePlaceholder: "Ex: Adultos de 25 a 50 anos que querem melhorar o sorriso mas têm medo de dentista ou não sabem por onde começar...",
    painPlaceholder: "Ex: Vergonha do próprio sorriso, medo de ir ao dentista, ou dor de dente que vem adiando há meses...",
  },
  "clinica-medica": {
    servicesPlaceholder: "Ex: Consulta clínica, Check-up, Pediatria, Dermatologia, Exames...",
    differentiatorPlaceholder: "Ex: Atendimento humanizado sem fila, agendamento online e retorno rápido de exames pelo WhatsApp...",
    taglinePlaceholder: "Ex: Cuidando da sua saúde com atenção",
    audiencePlaceholder: "Ex: Famílias e adultos de 30 a 60 anos que buscam um médico de confiança para acompanhamento contínuo da saúde...",
    painPlaceholder: "Ex: Dificuldade de encontrar consulta rápida e médico que explique tudo com clareza, sem apressar o paciente...",
  },
  "fisioterapia": {
    servicesPlaceholder: "Ex: Pilates, RPG, Fisioterapia ortopédica, Dry needling, Pós-cirúrgico...",
    differentiatorPlaceholder: "Ex: Atendimento individualizado, sem dividir sessão com outros pacientes. Profissional com pós-graduação em ortopedia...",
    taglinePlaceholder: "Ex: Movimento é saúde",
    audiencePlaceholder: "Ex: Adultos de 30 a 60 anos com dor crônica, pós-operatório ou lesões esportivas. Querem voltar a se mover sem dor...",
    painPlaceholder: "Ex: Dor nas costas ou joelho que limita a vida, piora com o dia a dia e não melhora com remédio...",
  },
  "nutricao": {
    servicesPlaceholder: "Ex: Plano alimentar, Reeducação alimentar, Nutrição esportiva, Acompanhamento online...",
    differentiatorPlaceholder: "Ex: Acompanhamento por aplicativo com retorno semanal. Dieta flexível sem proibir tudo que a pessoa gosta...",
    taglinePlaceholder: "Ex: Saúde que cabe na sua rotina",
    audiencePlaceholder: "Ex: Mulheres e homens de 25 a 45 anos que querem emagrecer, mas já tentaram várias dietas sem resultado duradouro...",
    painPlaceholder: "Ex: Efeito sanfona constante, não saber o que comer, ou fazer dieta restritiva demais que não sustenta...",
  },
  "psicologia": {
    servicesPlaceholder: "Ex: Terapia individual, Terapia de casal, Psicoterapia online, Avaliação psicológica...",
    differentiatorPlaceholder: "Ex: Atendimento online com flexibilidade de horário, abordagem cognitivo-comportamental com resultados práticos...",
    taglinePlaceholder: "Ex: Um espaço seguro para se reconectar",
    audiencePlaceholder: "Ex: Adultos de 25 a 40 anos com ansiedade, relacionamentos difíceis ou que sentem que algo está errado mas não sabem nomear...",
    painPlaceholder: "Ex: Ansiedade que não passa, dificuldade nos relacionamentos ou sensação de estar preso num padrão que se repete...",
  },
  "personal-trainer": {
    servicesPlaceholder: "Ex: Treino funcional, Musculação, Treino online, Emagrecimento, Hipertrofia...",
    differentiatorPlaceholder: "Ex: Treinos de 45 minutos adaptados para cada biotipo. Acompanhamento semanal por app com ajuste de carga...",
    taglinePlaceholder: "Ex: Resultados reais para vidas reais",
    audiencePlaceholder: "Ex: Mulheres e homens de 25 a 50 anos que querem emagrecer ou ganhar massa, mas não têm disciplina ou motivação sozinhos...",
    painPlaceholder: "Ex: Meses na academia sem resultado, não saber o que fazer ou sentir que o treino não está certo para o objetivo...",
  },
  "coaching": {
    servicesPlaceholder: "Ex: Coaching de carreira, Mentoria de negócios, Desenvolvimento pessoal, Palestra...",
    differentiatorPlaceholder: "Ex: Metodologia com ferramentas práticas, não só teoria. Acompanhamento semanal com metas reais e acompanhamento de progresso...",
    taglinePlaceholder: "Ex: Do potencial à realização",
    audiencePlaceholder: "Ex: Profissionais de 28 a 45 anos que se sentem estagnados na carreira ou querem empreender mas não sabem por onde começar...",
    painPlaceholder: "Ex: Sensação de estar preso numa rotina que não satisfaz, sem clareza do próximo passo ou falta de foco nos objetivos...",
  },
  "otica": {
    servicesPlaceholder: "Ex: Óculos de grau, Lentes de contato, Óculos de sol, Exame de vista, Ajuste...",
    differentiatorPlaceholder: "Ex: Exame de vista incluído na compra, modelos de marcas nacionais e importadas, laboratório próprio para lentes...",
    taglinePlaceholder: "Ex: Ver bem é tudo",
    audiencePlaceholder: "Ex: Famílias e adultos que precisam de óculos de grau ou sol, e buscam boa qualidade com preço justo e atendimento rápido...",
    painPlaceholder: "Ex: Dificuldade de enxergar que prejudica o trabalho e a direção, ou óculos quebrado sem saber onde fazer rápido e bem...",
  },
  "pet-shop": {
    servicesPlaceholder: "Ex: Banho e tosa, Veterinário, Vacinas, Hotel pet, Ração e acessórios...",
    differentiatorPlaceholder: "Ex: Atendimento com hora marcada, equipe capacitada e fotos do pet durante o banho enviadas pelo WhatsApp...",
    taglinePlaceholder: "Ex: Seu pet em boas mãos",
    audiencePlaceholder: "Ex: Tutores de cães e gatos de 25 a 45 anos que tratam o pet como membro da família e priorizam saúde e bem-estar do animal...",
    painPlaceholder: "Ex: Medo de deixar o pet em mãos que não conhece, ou não saber se o animal está sendo bem tratado durante o banho...",
  },
  "restaurante": {
    servicesPlaceholder: "Ex: Almoço executivo, Delivery, Jantar especial, Cardápio fitness, Refeições por kg...",
    differentiatorPlaceholder: "Ex: Ingredientes frescos comprados todo dia, cardápio que muda semanalmente, ambiente familiar e aconchegante...",
    taglinePlaceholder: "Ex: Sabor de casa todo dia",
    audiencePlaceholder: "Ex: Trabalhadores e famílias da região que buscam almoço rápido, saboroso e com preço justo durante a semana...",
    painPlaceholder: "Ex: Comer mal no trabalho por falta de opção boa por perto, ou gastar caro em delivery sem saber se vai ser bom...",
  },
  "confeitaria": {
    servicesPlaceholder: "Ex: Bolo no pote, Bem-casado, Trufas, Bolos decorados, Encomendas personalizadas...",
    differentiatorPlaceholder: "Ex: Produção artesanal com ingredientes selecionados, sem conservantes, embalagem caprichada para presentear...",
    taglinePlaceholder: "Ex: Feito com amor, entregue com cuidado",
    audiencePlaceholder: "Ex: Mulheres de 25 a 45 anos que encomendam doces para eventos, presentear ou consumo próprio. Valorizam qualidade e apresentação...",
    painPlaceholder: "Ex: Receber doces sem capricho na apresentação, ou não encontrar confeiteira confiável para eventos importantes...",
  },
  "loja-roupa": {
    servicesPlaceholder: "Ex: Roupas femininas, Moda plus size, Acessórios, Consultoria de estilo, Looks do dia...",
    differentiatorPlaceholder: "Ex: Peças exclusivas que não são encontradas em grandes lojas, curadoria de estilo personalizada e atendimento por WhatsApp...",
    taglinePlaceholder: "Ex: Estilo que combina com você",
    audiencePlaceholder: "Ex: Mulheres de 20 a 40 anos que gostam de se vestir bem mas têm dificuldade de montar looks ou encontrar peças que caibam bem...",
    painPlaceholder: "Ex: Gastar dinheiro em roupas que não ficam boas ou não saber como combinar peças do guarda-roupa...",
  },
  "fotografia": {
    servicesPlaceholder: "Ex: Ensaio feminino, Fotografia de casamento, Newborn, Foto de produto, Filmagem...",
    differentiatorPlaceholder: "Ex: Entrega em até 15 dias, galeria online para baixar fotos, direção de poses incluída no serviço...",
    taglinePlaceholder: "Ex: Momentos que ficam para sempre",
    audiencePlaceholder: "Ex: Casais, mães e empresários de 25 a 45 anos que querem registrar momentos importantes com qualidade profissional...",
    painPlaceholder: "Ex: Fotos amadoras que não fazem jus ao momento, ou não saber como se comportar na frente da câmera...",
  },
  "imobiliaria": {
    servicesPlaceholder: "Ex: Venda de imóveis, Aluguel, Avaliação, Financiamento, Gestão de propriedades...",
    differentiatorPlaceholder: "Ex: Atendimento consultivo, não empurra imóvel — entende o que o cliente precisa e apresenta só opções que fazem sentido...",
    taglinePlaceholder: "Ex: O lar certo, na hora certa",
    audiencePlaceholder: "Ex: Famílias e jovens casais de 28 a 45 anos querendo comprar o primeiro imóvel ou investir, mas perdidos no processo de financiamento...",
    painPlaceholder: "Ex: Medo de fazer mau negócio, não entender o processo de financiamento ou encontrar um corretor que suma depois da venda...",
  },
  "construcao": {
    servicesPlaceholder: "Ex: Reforma residencial, Pintura, Instalação elétrica, Alvenaria, Acabamento...",
    differentiatorPlaceholder: "Ex: Orçamento detalhado e por escrito, prazo cumprido com contrato, equipe própria sem terceirização de obra...",
    taglinePlaceholder: "Ex: Obra com qualidade e prazo garantido",
    audiencePlaceholder: "Ex: Proprietários de 30 a 55 anos que querem reformar a casa mas têm medo de empreiteiro que some, estoura o orçamento ou faz mal-feito...",
    painPlaceholder: "Ex: Já foi enganado por prestador que sumiu no meio da obra, ou reforma que custou o dobro do orçado...",
  },
  "mecanica": {
    servicesPlaceholder: "Ex: Revisão geral, Troca de óleo, Freios, Suspensão, Diagnóstico eletrônico...",
    differentiatorPlaceholder: "Ex: Orçamento antes de começar, peças originais com nota fiscal, laudo técnico por escrito e garantia de 90 dias...",
    taglinePlaceholder: "Ex: Seu carro em boas mãos",
    audiencePlaceholder: "Ex: Motoristas de 25 a 55 anos que dependem do carro para trabalhar e querem mecânica honesta que não invente problema...",
    painPlaceholder: "Ex: Medo de ser enganado na mecânica, pagar caro por algo que não precisava ou não ter laudo do que foi feito...",
  },
  "serralheria": {
    servicesPlaceholder: "Ex: Portão automático, Grade de segurança, Escada, Estrutura metálica, Cobertura...",
    differentiatorPlaceholder: "Ex: Fabricação própria, visita técnica gratuita, garantia de 2 anos nos produtos instalados...",
    taglinePlaceholder: "Ex: Segurança e resistência em cada peça",
    audiencePlaceholder: "Ex: Proprietários de residências e comércios que precisam de proteção e estética em portões e grades, priorizando durabilidade...",
    painPlaceholder: "Ex: Portão quebrado ou grade com ferrugem que compromete a segurança e a aparência do imóvel...",
  },
  "advogacia": {
    servicesPlaceholder: "Ex: Direito trabalhista, Direito de família, Inventário, Contratos, Defesa criminal...",
    differentiatorPlaceholder: "Ex: Atendimento transparente com honorários claros desde a primeira consulta, sem surpresas no meio do processo...",
    taglinePlaceholder: "Ex: Seus direitos, nossa prioridade",
    audiencePlaceholder: "Ex: Pessoas de 30 a 55 anos que estão passando por separação, demissão injusta ou processo judicial e não sabem seus direitos...",
    painPlaceholder: "Ex: Sentir que foi prejudicado e não saber como agir, medo de perder o processo ou de honorários absurdos...",
  },
  "contabilidade": {
    servicesPlaceholder: "Ex: Abertura de empresa, Declaração de IR, Folha de pagamento, BPO Financeiro, MEI...",
    differentiatorPlaceholder: "Ex: Atendimento por WhatsApp sem demora, relatórios mensais em linguagem simples, sem jargão contábil...",
    taglinePlaceholder: "Ex: Sua empresa em ordem, você em paz",
    audiencePlaceholder: "Ex: MEIs, pequenos empresários e autônomos de 25 a 45 anos que querem regularizar o negócio mas não entendem de contabilidade...",
    painPlaceholder: "Ex: Medo de multa da Receita Federal, confusão com impostos ou não saber se o contador atual está fazendo o trabalho direito...",
  },
  "escola-cursos": {
    servicesPlaceholder: "Ex: Curso online, Aulas presenciais, Mentoria em grupo, Certificado, Workshop...",
    differentiatorPlaceholder: "Ex: Metodologia prática com projetos reais, suporte individual por WhatsApp e certificado reconhecido pelo mercado...",
    taglinePlaceholder: "Ex: O conhecimento que muda carreiras",
    audiencePlaceholder: "Ex: Jovens de 18 a 35 anos que querem mudar de área, aprender uma habilidade nova ou se qualificar para ganhar mais...",
    painPlaceholder: "Ex: Cursos longos e caros que não ensinam o que o mercado quer, ou conteúdo muito teórico sem aplicação prática...",
  },
  "tatuagem": {
    servicesPlaceholder: "Ex: Tatuagem realista, Blackwork, Fine line, Aquarela, Coverup, Piercing...",
    differentiatorPlaceholder: "Ex: Arte 100% autoral, orçamento com desenho antes de tatuar e cuidados pós-tattoo incluídos no atendimento...",
    taglinePlaceholder: "Ex: Arte que conta a sua história",
    audiencePlaceholder: "Ex: Jovens e adultos de 18 a 35 anos apaixonados por arte corporal que querem uma tattoo com significado e feita por um artista de confiança...",
    painPlaceholder: "Ex: Medo de tatuar e arrepender, ou já ter tido experiência ruim com tatuador que não entendeu o que queria...",
  },
  "outro": {
    servicesPlaceholder: "Ex: Serviço A, Serviço B, Serviço C...",
    differentiatorPlaceholder: "Ex: O que faz seu negócio diferente — atendimento, resultado, tecnologia, localização, preço, experiência...",
    taglinePlaceholder: "Ex: Uma frase curta que resume o que você entrega",
    audiencePlaceholder: "Ex: Quem são seus clientes típicos, idade, situação de vida, o que eles querem e o que eles temem...",
    painPlaceholder: "Ex: Qual o principal problema que seu cliente resolve ao te contratar...",
  },
};

function detectNicheKey(text: string): string {
  const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (t.match(/barb|cabelei/)) return "barbearia";
  if (t.match(/salao|salon|beleza/)) return "salao-beleza";
  if (t.match(/estet|sobrancelh|depilac/)) return "estetica";
  if (t.match(/odonto|dent|ortodon/)) return "odontologia";
  if (t.match(/clinic|medic|saude|hospital/)) return "clinica-medica";
  if (t.match(/fisio|pilates|reabili/)) return "fisioterapia";
  if (t.match(/nutri|alimentar|dieta/)) return "nutricao";
  if (t.match(/psicol|terapia|mental|psicoter/)) return "psicologia";
  if (t.match(/personal|treino|academia|fitness|musculac/)) return "personal-trainer";
  if (t.match(/coach|mentor|consultori|assessori|market|agencia|trafego|social media|publicidade/)) return "coaching";
  if (t.match(/otica|ocul|lente de contato/)) return "otica";
  if (t.match(/pet|vet|animal|caes|gatos/)) return "pet-shop";
  if (t.match(/restaur|comida|delivery|lanch|pizza|hamburger|padaria/)) return "restaurante";
  if (t.match(/confeit|bolo|doce|brigadeiro|bem.casado/)) return "confeitaria";
  if (t.match(/roupa|moda|vestuario|acessorio|loja de/)) return "loja-roupa";
  if (t.match(/fotogr|filmag|video|audiovisual/)) return "fotografia";
  if (t.match(/imobil|imovel|corretor|aluguel/)) return "imobiliaria";
  if (t.match(/construc|reforma|obra|pintora|alvenar|eletric/)) return "construcao";
  if (t.match(/mecanic|autom|carro|oficina|funilaria/)) return "mecanica";
  if (t.match(/serral|portao|grade|metal|estrutura/)) return "serralheria";
  if (t.match(/advog|juridic|direito|processo/)) return "advogacia";
  if (t.match(/contab|fiscal|imposto|contador|mei|empresa/)) return "contabilidade";
  if (t.match(/escola|curso|aula|ensino|educac|treinamento/)) return "escola-cursos";
  if (t.match(/tatua|piercing|studio|estudio/)) return "tatuagem";
  return "outro";
}

function getNicheHints(niche: string, customNiche?: string) {
  if (niche === "outro" && customNiche?.trim()) {
    const detected = detectNicheKey(customNiche);
    if (detected !== "outro") return NICHE_HINTS[detected];
  }
  return NICHE_HINTS[niche] ?? NICHE_HINTS["outro"];
}

const TOTAL_STEPS = 6;

const STEP_LABELS = ["Negócio", "Serviços", "Público", "Comunicação", "Objetivos", "Contato"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-300"}`}>
                {label}
              </span>
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mb-4 mx-1 transition-all duration-300 ${done ? "bg-indigo-400" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

type FormState = BusinessFormData & {
  goals: string[];
  tone: string;
  differentiator: string;
  customer_pain: string;
  custom_niche: string;
};

export default function GerarKitPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    business_name: "",
    niche: "",
    city: "",
    whatsapp: "",
    instagram: "",
    address: "",
    main_service: "",
    services: "",
    primary_color: "#6366f1",
    tagline: "",
    target_audience: "",
    goals: [],
    tone: "",
    differentiator: "",
    customer_pain: "",
    custom_niche: "",
  });

  const effectiveNicheKey = form.niche === "outro" && form.custom_niche?.trim()
    ? detectNicheKey(form.custom_niche)
    : form.niche;
  const selectedNiche = effectiveNicheKey ? NICHE_CONFIG[effectiveNicheKey] : null;

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleGoal(id: string) {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id],
    }));
  }

  function canAdvance(): boolean {
    if (step === 1) {
      if (!form.business_name.trim() || !form.niche) return false;
      if (form.niche === "outro" && !form.custom_niche.trim()) return false;
      return true;
    }
    if (step === 2) return !!form.main_service.trim();
    if (step === 3) return !!form.target_audience?.trim() && !!form.city.trim();
    if (step === 4) return !!form.tone;
    if (step === 5) return form.goals.length > 0;
    if (step === 6) return !!form.whatsapp.trim();
    return true;
  }

  function getMissingHint(): string | null {
    if (canAdvance()) return null;
    if (step === 1) {
      if (!form.business_name.trim()) return "Preencha o nome do seu negócio para continuar";
      if (!form.niche) return "Selecione o segmento do seu negócio";
      if (form.niche === "outro" && !form.custom_niche.trim()) return "Descreva o seu segmento exato para continuar";
    }
    if (step === 2) return "Preencha o serviço principal para continuar";
    if (step === 3) {
      if (!form.target_audience?.trim()) return "Descreva o seu cliente ideal para continuar";
      if (!form.city.trim()) return "Informe a cidade de atendimento";
    }
    if (step === 4) return "Escolha o tom de voz do seu negócio";
    if (step === 5) return "Selecione pelo menos um objetivo para continuar";
    if (step === 6) return "Informe o seu WhatsApp para continuar";
    return null;
  }

  function next() {
    if (!canAdvance()) {
      setError("Preencha os campos obrigatórios para continuar.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!canAdvance()) {
      setError("Preencha o WhatsApp para continuar.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/kit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao gerar o kit."); setLoading(false); return; }
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MeuNegócio Pro
          </Link>
          <span className="text-xs text-gray-400 font-medium">Etapa {step} de {TOTAL_STEPS}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        {/* ── STEP 1: Nome + Nicho ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sobre o seu negócio</h1>
              <p className="text-gray-500 mt-1 text-sm">Essas informações personalizam tudo que será criado para você.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do negócio <span className="text-red-400">*</span>
              </label>
              <input
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="Ex: Barbearia Elite, Clínica Dra. Ana..."
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Qual é o seu segmento? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {NICHE_CARDS.map((n) => {
                  const active = form.niche === n.value;
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => set("niche", n.value)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-tight ${active ? "text-indigo-700" : "text-gray-800"}`}>
                        {n.label}
                      </p>
                      <p className={`text-xs mt-0.5 leading-tight ${active ? "text-indigo-500" : "text-gray-400"}`}>
                        {n.sub}
                      </p>
                    </button>
                  );
                })}
              </div>

              {form.niche === "outro" && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Qual é o seu segmento exato? <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.custom_niche}
                    onChange={(e) => set("custom_niche", e.target.value)}
                    placeholder="Ex: Escola de dança, Clínica veterinária, Loja de suplementos..."
                    style={{ color: "#111827", backgroundColor: "#ffffff" }}
                    className="w-full border border-indigo-200 bg-indigo-50/30 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Quanto mais específico, melhor o sistema entende o seu negócio.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Serviços + Diferencial ───────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">O que você oferece</h1>
              <p className="text-gray-500 mt-1 text-sm">Quanto mais específico, mais precisos ficam seus conteúdos.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Serviço principal <span className="text-red-400">*</span>
              </label>
              {selectedNiche && (
                <p className="text-xs text-indigo-500 mb-2">Sugestão: {selectedNiche.services[0]}</p>
              )}
              <input
                value={form.main_service}
                onChange={(e) => set("main_service", e.target.value)}
                placeholder={selectedNiche?.services[0] ?? "Ex: Corte masculino, Clareamento dental..."}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Outros serviços que você oferece
                <span className="text-gray-400 font-normal ml-1">(separados por vírgula)</span>
              </label>
              {selectedNiche && (
                <p className="text-xs text-indigo-500 mb-2">Sugestão: {selectedNiche.services.join(", ")}</p>
              )}
              <input
                value={form.services}
                onChange={(e) => set("services", e.target.value)}
                placeholder={getNicheHints(form.niche || "outro", form.custom_niche).servicesPlaceholder}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                O que te diferencia da concorrência?
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Atendimento, localização, preço, resultado, tecnologia, experiência — o que te faz diferente?
              </p>
              <textarea
                value={form.differentiator}
                onChange={(e) => set("differentiator", e.target.value)}
                placeholder={getNicheHints(form.niche || "outro", form.custom_niche).differentiatorPlaceholder}
                rows={3}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Frase que define o seu negócio
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <input
                value={form.tagline ?? ""}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder={getNicheHints(form.niche || "outro", form.custom_niche).taglinePlaceholder}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Público-alvo ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Para quem você vende</h1>
              <p className="text-gray-500 mt-1 text-sm">Esse é o campo mais importante. Quanto mais detalhe você der, mais personalizados ficam seus conteúdos.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Descreva o seu cliente ideal <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Pense em quem compra de você com mais frequência. Idade, situação de vida, o que essa pessoa quer e o que ela teme.
              </p>
              <textarea
                value={form.target_audience ?? ""}
                onChange={(e) => set("target_audience", e.target.value)}
                placeholder={getNicheHints(form.niche || "outro", form.custom_niche).audiencePlaceholder}
                rows={5}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Qual a maior dor ou problema que seu cliente resolve ao te contratar?
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Esse é o problema que faz o cliente finalmente te buscar. É o que aparece nos conteúdos que mais convertem.
              </p>
              <textarea
                value={form.customer_pain}
                onChange={(e) => set("customer_pain", e.target.value)}
                placeholder={getNicheHints(form.niche || "outro", form.custom_niche).painPlaceholder}
                rows={3}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Cidade de atendimento <span className="text-red-400">*</span>
              </label>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Ex: São Paulo – SP"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Tom de voz ───────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Como você se comunica</h1>
              <p className="text-gray-500 mt-1 text-sm">Isso define o tom de todos os textos gerados — posts, legendas, roteiros e mensagens de WhatsApp.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Escolha o tom que representa o seu negócio <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2.5">
                {TONE_OPTIONS.map((t) => {
                  const active = form.tone === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("tone", t.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-gray-800"}`}>
                          {t.label}
                        </p>
                        {active && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${active ? "text-indigo-500" : "text-gray-400"}`}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Objetivos ────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">O que você quer conquistar</h1>
              <p className="text-gray-500 mt-1 text-sm">Selecione todos que fazem sentido para o seu momento atual.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {GOALS.map((g) => {
                const selected = form.goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      selected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium leading-tight ${selected ? "text-indigo-700" : "text-gray-700"}`}>
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.goals.length > 0 && (
              <p className="text-xs text-indigo-600 font-medium">
                {form.goals.length} objetivo{form.goals.length > 1 ? "s" : ""} selecionado{form.goals.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ── STEP 6: Contato + Visual ─────────────────────────── */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Como te encontrar</h1>
              <p className="text-gray-500 mt-1 text-sm">Usados no mini site e nas mensagens de WhatsApp geradas.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp <span className="text-red-400">*</span>
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", phoneInputMask(e.target.value))}
                placeholder="(11) 99999-9999"
                type="tel"
                maxLength={16}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Instagram <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@seunegocio"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Endereço <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rua das Flores, 123 — Bairro"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor principal da marca
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{form.primary_color}</p>
                  <p className="text-xs text-gray-400">Usada nos posts e no seu mini site</p>
                </div>
              </div>
            </div>

            {/* Resumo final */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Resumo do seu perfil</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Negócio</span>
                  <span className="text-gray-800 font-medium">{form.business_name} — {NICHE_CARDS.find(n => n.value === form.niche)?.label}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Serviço</span>
                  <span className="text-gray-800">{form.main_service}</span>
                </div>
                {form.target_audience && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-28 flex-shrink-0">Público</span>
                    <span className="text-gray-800">{form.target_audience.slice(0, 70)}{form.target_audience.length > 70 ? "..." : ""}</span>
                  </div>
                )}
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Tom</span>
                  <span className="text-gray-800">{TONE_OPTIONS.find(t => t.value === form.tone)?.label}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Objetivos</span>
                  <span className="text-gray-800">{form.goals.map(g => GOALS.find(go => go.id === g)?.label).filter(Boolean).join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Dica de campo faltando */}
        {getMissingHint() && (
          <p className="mt-4 text-xs text-amber-600 font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {getMissingHint()}
          </p>
        )}

        {/* Navegação */}
        <div className="mt-4 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="flex-shrink-0 px-6 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Voltar
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canAdvance()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando seu perfil...
                </>
              ) : (
                "Criar perfil e acessar o sistema"
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
