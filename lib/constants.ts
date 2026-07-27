// PLACEHOLDER: substitua pelo número real do WhatsApp da loja (formato internacional,
// só dígitos, ex: 5515999998888) via variável de ambiente NEXT_PUBLIC_WHATSAPP_NUMBER.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5515900000000";

export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/DmNY3CgBn1jGexHtvBOOHS";

// Usada para montar links absolutos (ex: link do produto na mensagem do
// WhatsApp). Troque via NEXT_PUBLIC_SITE_URL quando o domínio definitivo
// estiver configurado.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://outlet-ebon.vercel.app").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Outlet Premium Sorocaba";

export const SITE_DESCRIPTION =
  "Produtos importados e de oportunidade em Sorocaba: iPhones por encomenda, Apple Watch, fones, tênis, perfumes importados e acessórios de tecnologia.";
