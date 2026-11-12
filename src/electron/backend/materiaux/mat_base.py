MATERIAUX =  {
    "version": "1.0",
    "unites": {
        "rho": "kg/m3",
        "E": "MPa",
        "nu": "sans unite",
        "Re": "MPa"
    },
    "convention": "Re = None signifie limite elastique indisponible/non pertinente pour le matériau générique.",
    "materiaux": {
        "Acier": {
            "rho": 7850,
            "E": 210000,
            "nu": 0.3,
            "Re": 235,
            "designation": "Acier de construction S235",
            "sources": [
                "https://engix.online/materials",
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf"
            ],
            "note": "Valeurs représentatives de l'acier de construction S235. Re = 235 MPa."
        },
        "Diamant": {
            "rho": 3520,
            "E": 1220000,
            "nu": 0.2,
            "Re": None,
            "designation": "Diamant (propriété isotrope simplifiée)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm"
            ],
            "note": "Le diamant est anisotrope et fragile ; E et nu sont des valeurs simplifiées. Pas de limite élastique ductile utilisée ici."
        },
        "Fer": {
            "rho": 7870,
            "E": 210000,
            "nu": 0.29,
            "Re": 150,
            "designation": "Fer / fer pur (valeurs représentatives)",
            "sources": [
                "https://cave.cs.columbia.edu/Statics/publications/pdfs/Beveridge_Preprint25.pdf",
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html"
            ],
            "note": "Re = 150 MPa est une valeur représentative au sein de la plage indicative publiée pour les formes de fer ; dépend fortement de la pureté et de l'état."
        },
        "Fontes": {
            "rho": 7300,
            "E": 110000,
            "nu": 0.26,
            "Re": 140,
            "designation": "Fonte grise (approximation)",
            "sources": [
                "https://cave.cs.columbia.edu/Statics/publications/pdfs/Beveridge_Preprint25.pdf",
                "https://geratools.com/young-modulus-reference"
            ],
            "note": "La fonte grise est fragile ; Re est une approximation pédagogique et ne remplace pas une résistance à la rupture/compression propre à une nuance."
        },
        "Laiton(Cu+Zn)": {
            "rho": 8470,
            "E": 100000,
            "nu": 0.34,
            "Re": 180,
            "designation": "Laiton (alliage générique)",
            "sources": [
                "https://cave.cs.columbia.edu/Statics/publications/pdfs/Beveridge_Preprint25.pdf",
                "https://geratools.com/young-modulus-reference"
            ],
            "note": "Valeurs génériques ; la limite élastique varie fortement avec la composition et l'écrouissage."
        },
        "Aluminium": {
            "rho": 2700,
            "E": 68900,
            "nu": 0.33,
            "Re": 276,
            "designation": "Aluminium 6061-T6",
            "sources": [
                "https://engitoolbox.org/calculators/materials",
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf"
            ],
            "note": "Nuance 6061-T6. E = 68,9 GPa, soit environ 70 000 MPa comme dans le cas de validation du sujet. Re = 276 MPa."
        },
        "Or": {
            "rho": 19300,
            "E": 79000,
            "nu": 0.44,
            "Re": None,
            "designation": "Or pur (valeurs typiques)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm",
                "https://geratools.com/young-modulus-reference"
            ],
            "note": "E et nu sont représentatifs. La limite d'élasticité de l'or dépend énormément de sa pureté et de son état (recuit/écroui) ; non fixée ici."
        },
        "Magnésium": {
            "rho": 1740,
            "E": 45000,
            "nu": 0.35,
            "Re": 200,
            "designation": "Alliage de magnésium (valeur représentative)",
            "sources": [
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf",
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html"
            ],
            "note": "Valeur indicative au sein de la plage de limites élastiques des alliages de magnésium ; la nuance doit être précisée pour un usage réel."
        },
        "Cuivre": {
            "rho": 8940,
            "E": 117000,
            "nu": 0.34,
            "Re": 70,
            "designation": "Cuivre C11000 (état recuit, indicatif)",
            "sources": [
                "https://engitoolbox.org/calculators/materials",
                "https://cave.cs.columbia.edu/Statics/publications/pdfs/Beveridge_Preprint25.pdf"
            ],
            "note": "Valeurs typiques du cuivre. Re dépend de l'état métallurgique ; valeur indicative pour cuivre recuit."
        },
        "Titane": {
            "rho": 4430,
            "E": 113800,
            "nu": 0.342,
            "Re": 880,
            "designation": "Alliage de titane Ti-6Al-4V",
            "sources": [
                "https://engitoolbox.org/calculators/materials",
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf"
            ],
            "note": "Nuance Ti-6Al-4V ; Re représentative de cette nuance."
        },
        "Béton": {
            "rho": 2400,
            "E": 30000,
            "nu": 0.2,
            "Re": None,
            "designation": "Béton courant (masse volumique normale)",
            "sources": [
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html",
                "https://reuven.tools/reference/material-properties/"
            ],
            "note": "Le béton est un matériau quasi-fragile ; on caractérise généralement sa résistance en compression, pas une limite élastique métallique Re. Re laissée indisponible."
        },
        "Verre": {
            "rho": 2500,
            "E": 70000,
            "nu": 0.22,
            "Re": None,
            "designation": "Verre sodocalcique (valeurs typiques)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm",
                "https://reuven.tools/reference/material-properties/"
            ],
            "note": "Matériau fragile : résistance à la rupture dépendante des défauts de surface ; pas de limite élastique ductile Re."
        },
        "Caoutchouc": {
            "rho": 920,
            "E": 0.5,
            "nu": 0.49,
            "Re": None,
            "designation": "Caoutchouc naturel souple (modèle linéaire simplifié)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm",
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html"
            ],
            "note": "E = 0,5 MPa est une valeur pédagogique représentative d'un caoutchouc très souple ; le caoutchouc réel est hyperélastique et ν est proche de 0,5. Le modèle linéaire du projet est une forte simplification."
        },
        "Polystyrène": {
            "rho": 1050,
            "E": 3200,
            "nu": 0.35,
            "Re": None,
            "designation": "Polystyrène compact (valeurs typiques)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm"
            ],
            "note": "Valeurs représentatives ; matériau polymère souvent fragile, sans Re générique fiable."
        },
        "Plomb": {
            "rho": 11300,
            "E": 16000,
            "nu": 0.44,
            "Re": 10,
            "designation": "Plomb (valeurs représentatives)",
            "sources": [
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf",
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html"
            ],
            "note": "Re = 10 MPa est une valeur indicative dans la plage publiée pour les alliages de plomb ; dépend de la composition."
        },
        "Zinc": {
            "rho": 7140,
            "E": 90000,
            "nu": 0.33,
            "Re": 80,
            "designation": "Zinc / alliage de zinc (valeur indicative)",
            "sources": [
                "https://www.ansys.com/content/dam/amp/2021/august/webpage-requests/education-resources-dam-upload-batch-2/material-property-data-for-eng-materials-BOKENGEN21.pdf",
                "https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/motion_pre/Formulations_and_Parameters.html"
            ],
            "note": "Valeur indicative ; les propriétés varient selon la nuance et le procédé."
        },
        "Silicium": {
            "rho": 2330,
            "E": 130000,
            "nu": 0.28,
            "Re": None,
            "designation": "Silicium cristallin (valeurs typiques)",
            "sources": [
                "https://www.aasri.jp/pub/spm/assistant_eng/properties_typical_materials.htm"
            ],
            "note": "Matériau fragile et anisotrope ; pas de limite élastique ductile générique."
        }
    }
}