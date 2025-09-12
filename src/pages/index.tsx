import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

import { useTranslation } from "next-i18next";

export default function Home() {
  const { t, i18n } = useTranslation("common");
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t("welcome")}</h1>
    </div>
  );
}
