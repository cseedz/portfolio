const CMS_STORAGE_KEY = "charles-portfolio-content";
const CMS_LEGACY_KEYS = ["charles-portfolio-content-clean-v1"];
const CMS_BACKUP_LATEST_KEY = "charles-portfolio-content-backup-latest";
// CMS hébergé sur Supabase : lecture publique (clé anon), écriture réservée
// au compte authentifié (RLS sur la table portfolio_cms).
const SUPABASE_URL = "https://dvivafrldxzhkactsvve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aXZhZnJsZHh6aGthY3RzdnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzQ5MDgsImV4cCI6MjA5NDgxMDkwOH0.EgyxWDERi443hefaM0LxDYDhLWQYx31feKzQ1bQU5Kc";
const CMS_CLOUD_ENDPOINT = `${SUPABASE_URL}/rest/v1/portfolio_cms`;

const DEFAULT_SITE_CONTENT = {"hero": {"text": "Biographie à venir."}, "_meta": {"updatedAt": "2026-07-23T00:00:00.000Z"}, "awards": {"items": [{"break": false, "title": "Prix Gémeaux", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2025 — Rouge forêt — Meilleure série jeunesse · Meilleure réalisation jeunesse · Meilleur texte", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2024 — Premier trio — Meilleure série jeunesse · Meilleure réalisation jeunesse-fiction", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2022 — La Panne S2 — Meilleure réalisation (médias numériques : jeunesse)", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2018 — Format Familial — Meilleur montage (magazine)", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": true, "title": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "Festivals & autres distinctions", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2022 — Dors avec moi — Melbourne WebFest : International Drama · Best Director", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2022 — Dors avec moi — Baltimore Next Media Web Fest : Best Drama · Best Director of Drama (Charles Grenier) · Best Actress in Drama (Sophie Cadieux) · Best Trailer", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2022 — Dors avec moi — Rio WebFest : Best Trailer", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2022 — Dors avec moi — Minnesota WebFest : Best Trailer", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2021 — Claire et les vieux — Die Seriale : Meilleure série", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2021 — Claire et les vieux — Prix Numix : Meilleure série web de fiction", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2020 — Claire et les vieux — Canneseries : Meilleure série courte", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2019 — Georges est mort — Los Angeles Film Awards : Best Series · Best Picture", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2019 — Georges est mort — New York Web Fest : Meilleure série étrangère", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2019 — Georges est mort — Vegas Movie Awards : Meilleur scénario · Meilleure série", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2018 — Le Ver — Prix Vitesse Lumière", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2017 — Slurpee — Lakeshorts International Film Festival : Prix William F. White (choix du jury)", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2016 — Chelem — Rendez-vous du cinéma québécois : Mention du jury", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2015 — La Canadienne française — Lakeshorts International Film Festival : Best Canadian Short Film · Best Cinematography · Jury’s Choice", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}], "label": "PRIX & DISTINCTIONS"}, "editing": {"items": [{"break": false, "title": "Fondation Marie Vincent", "video": "./videos/montages/spots/FMV_Fardeau_30sFR_16x9.mp4", "hidden": false, "credits": "PRODUCTION. SOMA, SIMON CORRIVEAU.", "creditRoles": [{"role": "PRODUCTION", "names": "SOMA, SIMON CORRIVEAU"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "Réalisé par Sarah Pellerin", "backgroundVideo": "./videos/montages/spots/FMV_Fardeau_30sFR_16x9.mp4", "presentationVideo": ""}, {"break": false, "title": "Centraide", "video": "./videos/montages/spots/Centraide Bonne fete directors cut - FR.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/Centraide Bonne fete directors cut - FR.mp4", "presentationVideo": ""}, {"break": false, "title": "YMCA · Scream", "video": "./videos/montages/spots/YWCA Scream 40s.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/YWCA Scream 40s.mp4", "presentationVideo": ""}, {"break": false, "title": "YMCA · Friday", "video": "./videos/montages/spots/YWCA Friday 30s.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/YWCA Friday 30s.mp4", "presentationVideo": ""}, {"break": false, "title": "Fonds de solidarité FTQ", "video": "./videos/montages/spots/Fonds FTQ Hiver 2025 directors cut.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/Fonds FTQ Hiver 2025 directors cut.mp4", "presentationVideo": ""}, {"break": false, "title": "BMO Spin", "video": "./videos/montages/spots/BMO Spin.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/BMO Spin.mp4", "presentationVideo": ""}, {"break": false, "title": "Fido x Pride", "video": "./videos/montages/spots/FIDO X PRIDE 2019 - MICHAEL SAM on Vimeo.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/FIDO X PRIDE 2019 - MICHAEL SAM on Vimeo.mp4", "presentationVideo": ""}, {"break": false, "title": "Fido's got you", "video": "./videos/montages/spots/Fido’s got you_CGL5sBhvdro_1080p.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/Fido’s got you_CGL5sBhvdro_1080p.mp4", "presentationVideo": ""}, {"break": false, "title": "Metro x Masterchef", "video": "./videos/montages/spots/Metro Masterchef.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/Metro Masterchef.mp4", "presentationVideo": ""}, {"break": false, "title": "Honda", "video": "./videos/montages/spots/Honda.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/spots/Honda.mp4", "presentationVideo": ""}, {"break": false, "title": "Don't · CRi", "video": "./videos/montages/videoclips/CRi - Don't ft. Gabriella Hook (Official Video).mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/videoclips/CRi - Don't ft. Gabriella Hook (Official Video).mp4", "presentationVideo": ""}, {"break": false, "title": "Cruising with you · Heart Streets", "video": "./videos/montages/videoclips/HeartStreets - Cruising with you.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/videoclips/HeartStreets - Cruising with you.mp4", "presentationVideo": ""}, {"break": false, "title": "Passing cars · Secret Sun", "video": "./videos/montages/videoclips/Secret sun Passing cars.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/videoclips/Secret sun Passing cars.mp4", "presentationVideo": ""}, {"break": false, "title": "L'air d'aller 2", "video": "./videos/montages/series/Air daller Bande-annonce - saison 2.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/montages/series/Air daller Bande-annonce - saison 2.mp4", "presentationVideo": ""}, {"break": false, "title": "Tous pour les tout-petits", "video": "", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "Réalisé par Olivier Staub", "backgroundVideo": "", "presentationVideo": "https://vimeo.com/1074006772/afc634759c?share=copy&fl=sv&fe=ci"}], "label": "MONTAGES"}, "sidebar": {"email": "hello@charlesgrenier.com", "location": "", "instagram": "https://www.instagram.com/charlesgrenier", "agentEmail": "Mathilde@agencemva.com", "letterboxd": "https://letterboxd.com/CharlesGrenier/"}, "studies": {"items": [{"break": false, "title": "2011 — Université Concordia — Baccalauréat en productions cinématographiques", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2011 — Université Concordia — Mineure en philosophie", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "2007 — Cégep de Sherbrooke — Diplôme d’études collégiales en communication, profil cinéma", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}], "label": "ÉTUDES"}, "directing": {"items": [{"break": false, "title": "Au-delà du terril", "video": "./videos/realisations/AU DELA DU TERRIL_MASTER.mp4", "hidden": false, "credits": "PRODUCTION. VOYELLES FILMS, GUILLAUME VASSEUR. — SCÉNARIO. CHARLES GRENIER. — ASSISTANT RÉALISATEUR. JULIEN FALARDEAU. — DIRECTION PHOTO. SIMRAN DEWAN. — COSTUMES. RENÉE SAWTELLE. — CHEF ÉLECTRO. DANIEL HO TIENG. — ÉTALONNAGE. OUTPOST, MARTIN GAUMONT.", "creditRoles": [{"role": "PRODUCTION", "names": "VOYELLES FILMS, GUILLAUME VASSEUR"}, {"role": "SCÉNARIO", "names": "CHARLES GRENIER"}, {"role": "ASSISTANT RÉALISATEUR", "names": "JULIEN FALARDEAU"}, {"role": "DIRECTION PHOTO", "names": "SIMRAN DEWAN"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": "RENÉE SAWTELLE"}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": "DANIEL HO TIENG"}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": "OUTPOST, MARTIN GAUMONT"}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "*Proof of concept*", "backgroundVideo": "./videos/realisations/AU DELA DU TERRIL_MASTER.mp4", "presentationVideo": "https://dvivafrldxzhkactsvve.supabase.co/storage/v1/object/public/portfolio/masters/realisations/au_dela_du_terril_master.mp4"}, {"break": false, "title": "Le ver", "video": "./videos/realisations/COURT-MÉTRAGE_LeVer_prod_Midi La Nuit.mp4", "hidden": false, "credits": "PRODUCTION. ANNICK BLANC. — SCÉNARIO. CHARLES GRENIER, MAXIME RAYMOND BOCK. — DIRECTION PHOTO. TOBIE MARIER-ROBITAILLE.", "creditRoles": [{"role": "PRODUCTION", "names": "ANNICK BLANC"}, {"role": "SCÉNARIO", "names": "CHARLES GRENIER, MAXIME RAYMOND BOCK"}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "TOBIE MARIER-ROBITAILLE"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/COURT-MÉTRAGE_LeVer_prod_Midi La Nuit.mp4", "presentationVideo": "https://vimeo.com/256515992"}, {"break": false, "title": "Slurpee", "video": "./videos/realisations/slurpee (Original).mp4", "hidden": false, "credits": "PRODUCTION. CHARLES GRENIER. — SCÉNARIO. CHARLES GRENIER. — DIRECTION PHOTO. JESSICA LEE GAGNÉ.", "creditRoles": [{"role": "PRODUCTION", "names": "CHARLES GRENIER"}, {"role": "SCÉNARIO", "names": "CHARLES GRENIER"}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "JESSICA LEE GAGNÉ"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/slurpee (Original).mp4", "presentationVideo": "https://dvivafrldxzhkactsvve.supabase.co/storage/v1/object/public/portfolio/masters/realisations/slurpee_original_.mp4"}, {"break": false, "title": "Chelem", "video": "./videos/realisations/chelem___bande-annonce_v1 (1080p).mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/chelem___bande-annonce_v1 (1080p).mp4", "presentationVideo": "https://vimeo.com/105197876"}, {"break": false, "title": "Étanche", "video": "./videos/realisations/Étanche___bande-annonce_v1 (1080p).mp4", "hidden": false, "credits": "PRODUCTION. ANNICK BLANC. — SCÉNARIO. CHARLES GRENIER. — DIRECTION PHOTO. JESSICA LEE GAGNÉ.", "creditRoles": [{"role": "PRODUCTION", "names": "ANNICK BLANC"}, {"role": "SCÉNARIO", "names": "CHARLES GRENIER"}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "JESSICA LEE GAGNÉ"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/Étanche___bande-annonce_v1 (1080p).mp4", "presentationVideo": "https://vimeo.com/grenierpellerin/etanche"}, {"break": false, "title": "La canadienne-française", "video": "./videos/realisations/la_canadienne_française_-_extrait_v1 (720p).mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/la_canadienne_française_-_extrait_v1 (720p).mp4", "presentationVideo": "https://vimeo.com/95822876"}, {"break": false, "title": "La dernière saison", "video": "", "hidden": false, "credits": "PRODUCTION. Pamplemousse. — DIRECTION PHOTO. Émile Desroche-L, Simran Dewan, Jules Cloutier Lacertes.", "creditRoles": [{"role": "PRODUCTION", "names": "Pamplemousse"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "Émile Desroche-L, Simran Dewan, Jules Cloutier Lacertes"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "Rouge forêt", "video": "./videos/realisations/Sizzler_Forêt_Rouge_EST.mp4", "hidden": false, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/Sizzler_Forêt_Rouge_EST.mp4", "presentationVideo": "https://vimeo.com/manage/videos/1047876233"}, {"break": false, "title": "Premier trio 1", "video": "./videos/realisations/TÉLÉ_PremierTrioS1_prod_AVANTI-TOAST.mp4", "hidden": false, "credits": "PRODUCTION. AVANTI TOATS, ISABELLE GAMELIN, IAN QUENNEVILLE. — DIRECTION PHOTO. BENOÎT JONES VALLÉE.", "creditRoles": [{"role": "PRODUCTION", "names": "AVANTI TOATS, ISABELLE GAMELIN, IAN QUENNEVILLE"}, {"role": "SCÉNARIOS", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "BENOÎT JONES VALLÉE"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/TÉLÉ_PremierTrioS1_prod_AVANTI-TOAST.mp4", "presentationVideo": ""}, {"break": false, "title": "Premier trio 2", "video": "./videos/realisations/TÉLÉ_PremierTrioS2_prod_AVANTI-TOAST.mp4", "hidden": false, "credits": "PRODUCTION. AVANTI TOAST, MARIE-HÉLÈNE FORTIER, IAN QUENNEVILLE. — DIRECTION PHOTO. ÉMILE DESROCHES-L.", "creditRoles": [{"role": "PRODUCTION", "names": "AVANTI TOAST, MARIE-HÉLÈNE FORTIER, IAN QUENNEVILLE"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "ÉMILE DESROCHES-L"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/TÉLÉ_PremierTrioS2_prod_AVANTI-TOAST.mp4", "presentationVideo": ""}, {"break": false, "title": "Dors avec moi", "video": "./videos/realisations/Sleep With Me - Teaser Original Title Dors avec moi.mp4", "hidden": false, "credits": "PRODUCTION. AVANTI. — DIRECTION PHOTO. SHAWN PAVLIN.", "creditRoles": [{"role": "PRODUCTION", "names": "AVANTI"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "SHAWN PAVLIN"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/Sleep With Me - Teaser Original Title Dors avec moi.mp4", "presentationVideo": ""}, {"break": false, "title": "Claire & les vieux", "video": "./videos/realisations/WEB_ClaireEtLesVieux_prod_UGO Media.mp4", "hidden": false, "credits": "PRODUCTION. UGO MÉDIA, PATRICK BILODEAU. — DIRECTION PHOTO. SHAWN PAVLIN.", "creditRoles": [{"role": "PRODUCTION", "names": "UGO MÉDIA, PATRICK BILODEAU"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "SHAWN PAVLIN"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/WEB_ClaireEtLesVieux_prod_UGO Media.mp4", "presentationVideo": ""}, {"break": false, "title": "Georges est mort", "video": "./videos/realisations/WEB_GeorgesEstMort_prod_2par2.mp4", "hidden": false, "credits": "PRODUCTION. 2 PAR 2, CAROLYNE BOUCHER. — SCÉNARIO. SARAH PELLERIN. — DIRECTION PHOTO. ARIEL MÉTHOT.", "creditRoles": [{"role": "PRODUCTION", "names": "2 PAR 2, CAROLYNE BOUCHER"}, {"role": "SCÉNARIO", "names": "SARAH PELLERIN"}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "ARIEL MÉTHOT"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/WEB_GeorgesEstMort_prod_2par2.mp4", "presentationVideo": ""}, {"break": false, "title": "Incarnat · Ariane Moffat", "video": "./videos/realisations/FILM_INCARNAT_prod_Casadel Films.mp4", "hidden": false, "credits": "PRODUCTION. CASADEL FILMS. — DIRECTION PHOTO. OLIVIER GOSSOT.", "creditRoles": [{"role": "PRODUCTION", "names": "CASADEL FILMS"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "OLIVIER GOSSOT"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "Co-réalisé avec Philippe Cyr", "backgroundVideo": "./videos/realisations/FILM_INCARNAT_prod_Casadel Films.mp4", "presentationVideo": ""}, {"break": false, "title": "Espoir · Ariane Moffat", "video": "./videos/realisations/Espoir par Ariane Moffatt sur Apple Music.mp4", "hidden": false, "credits": "PRODUCTION. CASADEL FILMS. — DIRECTION PHOTO. ARIEL MÉTHOT.", "creditRoles": [{"role": "PRODUCTION", "names": "CASADEL FILMS"}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": "ARIEL MÉTHOT"}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "./videos/realisations/Espoir par Ariane Moffatt sur Apple Music.mp4", "presentationVideo": ""}, {"break": false, "title": "La panne 2", "video": "", "hidden": true, "credits": "", "creditRoles": [{"role": "PRODUCTION", "names": ""}, {"role": "SCÉNARIO", "names": ""}, {"role": "ASSISTANTE RÉALISATRICE", "names": ""}, {"role": "DIRECTION PHOTO", "names": ""}, {"role": "PREMIER ASSISTANT-CAMÉRA", "names": ""}, {"role": "DIRECTION ARTISTIQUE", "names": ""}, {"role": "COSTUMES", "names": ""}, {"role": "MAQUILLAGE", "names": ""}, {"role": "CHEF ÉLECTRO", "names": ""}, {"role": "CHEF MACHINO", "names": ""}, {"role": "RÉGIE", "names": ""}, {"role": "MONTAGE", "names": ""}, {"role": "PRISE DE SON", "names": ""}, {"role": "ÉTALONNAGE", "names": ""}, {"role": "MIX & DESIGN SONORE", "names": ""}, {"role": "FOURNISSEURS", "names": ""}], "description": "", "backgroundVideo": "", "presentationVideo": ""}], "label": "RÉALISATIONS"}, "typography": {"bodySize": "18", "menuSize": "14", "titleSize": "18", "bodyWeight": "regular", "footerSize": "11", "kickerSize": "20", "footerWeight": "regular", "kickerWeight": "bold", "locationSize": "12", "heroTitleWeight": "regular", "workTitleWeight": "regular", "sectionTitleSize": "18", "sectionTitleWeight": "regular"}, "projectPages": {}, "collaborators": {"items": [{"break": false, "title": "Sarah Pellerin", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "Laura Lemelin Rainville", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "Émile Desroche-L", "video": "https://www.emiledl.com", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.emiledl.com", "presentationVideo": ""}, {"break": false, "title": "Simran Dewan", "video": "https://www.simrandewan.com", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.simrandewan.com", "presentationVideo": ""}, {"break": false, "title": "Simon Roy", "video": "https://www.simonroy.ca", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.simonroy.ca", "presentationVideo": ""}, {"break": false, "title": "Ariel Méthot", "video": "https://www.arielmethot.com", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.arielmethot.com", "presentationVideo": ""}, {"break": false, "title": "Jessica Lee Gagné", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}, {"break": false, "title": "Tobie Marier-Robitaille", "video": "https://www.tobiemarierrobitaille.com", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.tobiemarierrobitaille.com", "presentationVideo": ""}, {"break": false, "title": "Charles-Antoine Auger", "video": "https://www.1stac.ca", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.1stac.ca", "presentationVideo": ""}, {"break": false, "title": "Polygraphe", "video": "https://www.polygraphe.ca", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.polygraphe.ca", "presentationVideo": ""}, {"break": false, "title": "Le Confessionnal", "video": "https://www.leconfessionnal.ca", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "https://www.leconfessionnal.ca", "presentationVideo": ""}, {"break": false, "title": "Post-Moderne", "video": "", "hidden": false, "credits": "", "creditRoles": [], "description": "", "backgroundVideo": "", "presentationVideo": ""}], "label": "AMIES & AMIS"}, "imdbExclusions": {"editing": [], "directing": []}};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseContentRaw(raw) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function normalizeCreditRoleLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseCreditsTextToRoles(value) {
  const normalized = String(value || "").replace(/\s-\s/g, " — ");
  const blocks = normalized
    .split("—")
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const firstDot = block.indexOf(".");
      if (firstDot === -1) {
        return { role: normalizeCreditRoleLabel(block), names: "" };
      }

      const role = normalizeCreditRoleLabel(block.slice(0, firstDot));
      const names = block
        .slice(firstDot + 1)
        .replace(/\.$/, "")
        .replace(/\.\s+/g, ", ")
        .replace(/\s+/g, " ")
        .trim();
      return { role, names };
    })
    .filter((entry) => entry.role || entry.names);
}

function normalizeCreditRoles(creditRoles, creditsText) {
  if (Array.isArray(creditRoles)) {
    const normalizedEntries = creditRoles
      .map((entry) => ({
        role: normalizeCreditRoleLabel(entry?.role),
        names: String(entry?.names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);

    if (normalizedEntries.length) {
      return normalizedEntries;
    }
  }

  if (creditRoles && typeof creditRoles === "object") {
    const normalizedEntries = Object.entries(creditRoles)
      .map(([role, names]) => ({
        role: normalizeCreditRoleLabel(role),
        names: String(names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);

    if (normalizedEntries.length) {
      return normalizedEntries;
    }
  }

  const parsedFromText = parseCreditsTextToRoles(creditsText);
  if (parsedFromText.length) {
    return parsedFromText;
  }

  return [];
}

function normalizeMediaSource(value) {
  const source = String(value || "").trim();
  if (!source) {
    return "";
  }

  if (/^https?:\/\//i.test(source)) {
    return source;
  }

  let next = source.replace("./videos-web/", "./videos/");
  const parts = next.split("/");
  const montageIndex = parts.findIndex((segment) => segment.toLowerCase() === "montages");
  if (montageIndex >= 0 && montageIndex + 1 < parts.length) {
    const rawSegment = parts[montageIndex + 1];
    const decodedSegment = decodeURIComponent(rawSegment);
    const normalizedSegment = decodedSegment
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (normalizedSegment === "publicite" || normalizedSegment === "publicites" || normalizedSegment === "spots") {
      parts[montageIndex + 1] = "spots";
      next = parts.join("/");
    }
  }
  if (/\.mov(\?.*)?$/i.test(next)) {
    next = next.replace(/\.mov(\?.*)?$/i, ".mp4$1");
  }

  return next;
}

function normalizeProjectItems(items, fallbackItems = []) {
  const fallbackMap = new Map(
    (fallbackItems || [])
      .filter((entry) => entry?.title)
      .map((entry) => [String(entry.title), entry]),
  );

  return (items || []).map((item) => {
    if (typeof item === "string") {
      if (!item.trim()) {
        return {
          title: "",
          backgroundVideo: "",
          description: "",
          credits: "",
          creditRoles: [],
          presentationVideo: "",
          hidden: false,
          break: true,
        };
      }

      return {
        title: item,
        video: "",
        backgroundVideo: "",
        description: "",
        credits: "",
        creditRoles: [],
        presentationVideo: "",
        hidden: false,
        break: false,
      };
    }

    if (item?.break) {
      return {
        title: "",
        backgroundVideo: "",
        description: "",
        credits: "",
        creditRoles: [],
        presentationVideo: "",
        hidden: false,
        break: true,
      };
    }

    const fallback = fallbackMap.get(String(item?.title || "")) || null;

    const normalizedVideo = normalizeMediaSource(
      item?.video ||
      item?.backgroundVideo ||
      fallback?.video ||
      fallback?.backgroundVideo ||
      "",
    );
    const normalizedBackgroundVideo = normalizeMediaSource(
      item?.backgroundVideo ||
      item?.video ||
      fallback?.backgroundVideo ||
      fallback?.video ||
      "",
    );
    const normalizedPresentationVideo = normalizeMediaSource(
      item?.presentationVideo ||
      fallback?.presentationVideo ||
      "",
    );

    return {
      title: item?.title || "",
      video: normalizedVideo,
      backgroundVideo: normalizedBackgroundVideo,
      description: item?.description || "",
      credits: item?.credits || "",
      creditRoles: normalizeCreditRoles(item?.creditRoles, item?.credits || ""),
      presentationVideo: normalizedPresentationVideo,
      hidden: Boolean(item?.hidden),
      break: false,
    };
  });
}

function normalizeContent(content) {
  const defaults = deepClone(DEFAULT_SITE_CONTENT);
  const merged = {
    ...defaults,
    ...(content || {}),
  };

  merged.typography = {
    ...defaults.typography,
    ...(merged.typography || {}),
  };
  merged.sidebar = {
    ...defaults.sidebar,
    ...(merged.sidebar || {}),
  };
  merged.hero = {
    ...defaults.hero,
    ...(merged.hero || {}),
  };
  merged.directing = {
    ...defaults.directing,
    ...(merged.directing || {}),
  };
  merged.editing = {
    ...defaults.editing,
    ...(merged.editing || {}),
  };
  merged.awards = {
    ...defaults.awards,
    ...(merged.awards || {}),
  };
  merged.studies = {
    ...defaults.studies,
    ...(merged.studies || {}),
  };
  merged.collaborators = {
    ...defaults.collaborators,
    ...(merged.collaborators || {}),
  };
  merged.imdbExclusions = {
    ...defaults.imdbExclusions,
    ...(merged.imdbExclusions || {}),
  };
  merged._meta = {
    ...defaults._meta,
    ...(merged._meta || {}),
  };

  merged.directing.items = normalizeProjectItems(merged.directing.items, defaults.directing.items);
  merged.editing.items = normalizeProjectItems(merged.editing.items, defaults.editing.items);
  merged.awards.items = normalizeProjectItems(merged.awards.items);
  merged.studies.items = normalizeProjectItems(merged.studies.items);
  merged.collaborators.items = normalizeProjectItems(merged.collaborators.items);

  return merged;
}

function getCandidateKeys() {
  return [CMS_STORAGE_KEY, ...CMS_LEGACY_KEYS];
}

function pickBestStoredContent() {
  const primaryParsed = parseContentRaw(localStorage.getItem(CMS_STORAGE_KEY));
  if (primaryParsed) {
    return { key: CMS_STORAGE_KEY, parsed: primaryParsed };
  }

  for (const legacyKey of CMS_LEGACY_KEYS) {
    const legacyParsed = parseContentRaw(localStorage.getItem(legacyKey));
    if (legacyParsed) {
      return { key: legacyKey, parsed: legacyParsed };
    }
  }

  return null;
}

function loadSiteContent() {
  try {
    const best = pickBestStoredContent();
    if (!best) {
      window.CMS_LAST_LOAD_SOURCE = "default";
      return deepClone(DEFAULT_SITE_CONTENT);
    }

    const normalized = normalizeContent(best.parsed);
    window.CMS_LAST_LOAD_SOURCE = best.key;

    if (best.key !== CMS_STORAGE_KEY) {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch (error) {
    console.warn("Unable to load site content.", error);
    window.CMS_LAST_LOAD_SOURCE = "default-error";
    return deepClone(DEFAULT_SITE_CONTENT);
  }
}

function saveSiteContent(content) {
  const nextContent = normalizeContent(content);
  nextContent._meta.updatedAt = new Date().toISOString();

  const previousRaw = localStorage.getItem(CMS_STORAGE_KEY);
  if (previousRaw) {
    localStorage.setItem(CMS_BACKUP_LATEST_KEY, previousRaw);
  }

  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(nextContent));
  CMS_LEGACY_KEYS.forEach((legacyKey) => {
    localStorage.setItem(legacyKey, JSON.stringify(nextContent));
  });

  window.CMS_LAST_SAVE_SOURCE = "local";
  syncSiteContentToCloud(nextContent);
}

function dispatchCmsUpdateEvent(source) {
  try {
    window.dispatchEvent(
      new CustomEvent("cms:content-updated", {
        detail: { source: source || "unknown" },
      }),
    );
  } catch (error) {
    // no-op
  }
}

async function fetchCloudContent() {
  if (typeof fetch !== "function") {
    return null;
  }

  try {
    const response = await fetch(`${CMS_CLOUD_ENDPOINT}?key=eq.site&select=data`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const rows = await response.json();
    const content = Array.isArray(rows) ? rows[0]?.data : null;
    if (!content || typeof content !== "object") {
      return null;
    }

    return normalizeContent(content);
  } catch (error) {
    return null;
  }
}

async function pushCloudContent(content) {
  if (typeof fetch !== "function") {
    return { ok: false, status: 0 };
  }

  try {
    const authToken = String(window.CMS_AUTH_TOKEN || "").trim();
    if (!authToken) {
      return { ok: false, status: 401 };
    }

    const response = await fetch(`${CMS_CLOUD_ENDPOINT}?on_conflict=key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${authToken}`,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        { key: "site", data: content, updated_at: new Date().toISOString() },
      ]),
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return { ok: false, status: 0 };
  }
}

async function hydrateContentFromCloud() {
  const local = loadSiteContent();
  const cloud = await fetchCloudContent();
  if (!cloud) {
    return local;
  }

  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cloud));
  CMS_LEGACY_KEYS.forEach((legacyKey) => {
    localStorage.setItem(legacyKey, JSON.stringify(cloud));
  });
  window.CMS_LAST_LOAD_SOURCE = "cloud";
  dispatchCmsUpdateEvent("cloud");
  return cloud;
}

function syncSiteContentToCloud(content) {
  pushCloudContent(content).then((result) => {
    const ok = Boolean(result?.ok);
    window.CMS_LAST_SAVE_SOURCE = ok ? "cloud" : "local-only";
    try {
      window.dispatchEvent(
        new CustomEvent("cms:save-result", {
          detail: {
            ok,
            status: Number(result?.status || 0),
            mode: ok ? "cloud" : "local-only",
          },
        }),
      );
    } catch (error) {
      // no-op
    }
  });
}

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.CMS_STORAGE_KEY = CMS_STORAGE_KEY;
window.CMS_COMPAT_KEYS = getCandidateKeys();
window.DEFAULT_SITE_CONTENT = DEFAULT_SITE_CONTENT;
window.loadSiteContent = loadSiteContent;
window.saveSiteContent = saveSiteContent;
window.hydrateContentFromCloud = hydrateContentFromCloud;
window.deepClone = deepClone;
window.IMDB_DIRECTING_TITLES = [];
window.IMDB_EDITING_TITLES = [];

hydrateContentFromCloud();
