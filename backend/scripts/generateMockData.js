'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mysql  = require('mysql2/promise');
const bcrypt = require('bcrypt');

// ── Turkish name pools ────────────────────────────────────────────────────────

const M = [
  'Ahmet','Mehmet','Ali','Mustafa','İbrahim','Hasan','Hüseyin','Ömer',
  'Yusuf','Bekir','Murat','Serkan','Emre','Burak','Barış','Tolga','Onur',
  'Cem','Kaan','Ozan','Furkan','Enes','Kadir','Baran','Eren','Oğuz','Uğur',
  'Taner','Soner','Ercan','Yasin','Tarık','Selçuk','Sinan','Tamer','Kerem',
  'Volkan','Bülent','Adem','Cengiz','Halit','İsmail','Fuat','Sedat','Nazım',
  'Ramazan','Orhan','Fikret','Zeki','Münir',
];

const F = [
  'Ayşe','Fatma','Zeynep','Elif','Emine','Hatice','Meryem','Esra','Selin',
  'Merve','Ceren','Büşra','Pınar','Tuğba','Gizem','Cansu','Derya','Melek',
  'Sevgi','Nurcan','Gamze','Yasemin','Aslı','Duygu','Hande','Işıl','Ebru',
  'Filiz','Irmak','Kübra','Lale','Melis','Nazlı','Özge','Seda','Neslihan',
  'Cemre','Damla','Buse','Dilek','Güneş','Serap','Zümra','Aylin','Şule',
  'Nilüfer','Gülay','Alev','Yağmur','Rabia',
];

const SN = [
  'Yılmaz','Kaya','Demir','Çelik','Şahin','Yıldız','Yıldırım','Öztürk',
  'Aydın','Özdemir','Arslan','Doğan','Kılıç','Aslan','Çetin','Kara','Koç',
  'Kurt','Özcan','Şimşek','Polat','Aksoy','Korkmaz','Erdoğan','Güneş',
  'Tekin','Kaplan','Duman','Başar','Küçük','Güler','Demirtaş','Avcı',
  'Karaca','Uysal','Türk','Dinç','Peker','Aktaş','Bozkurt','Özçelik',
  'Korkut','Tunç','Gündüz','Sönmez','Yüksel','Bulut','Güven','Acar','Karakaş',
];

const ADDRS = [
  'Kadıköy, İstanbul',   'Beşiktaş, İstanbul',  'Şişli, İstanbul',
  'Üsküdar, İstanbul',   'Pendik, İstanbul',     'Maltepe, İstanbul',
  'Ataşehir, İstanbul',  'Bağcılar, İstanbul',   'Çankaya, Ankara',
  'Keçiören, Ankara',    'Mamak, Ankara',         'Etimesgut, Ankara',
  'Sincan, Ankara',      'Bornova, İzmir',        'Karşıyaka, İzmir',
  'Konak, İzmir',        'Çiğli, İzmir',          'Bayraklı, İzmir',
  'Nilüfer, Bursa',      'Osmangazi, Bursa',      'Yıldırım, Bursa',
  'Muratpaşa, Antalya',  'Kepez, Antalya',        'Konyaaltı, Antalya',
  'Seyhan, Adana',       'Yüreğir, Adana',        'Çukurova, Adana',
  'Selçuklu, Konya',     'Meram, Konya',          'Karatay, Konya',
  'Şahinbey, Gaziantep', 'Şehitkamil, Gaziantep', 'Mezitli, Mersin',
  'Tarsus, Mersin',      'Toroslar, Mersin',      'Odunpazarı, Eskişehir',
  'Tepebaşı, Eskişehir', 'Atakum, Samsun',        'İlkadım, Samsun',
  'Canik, Samsun',       'Gebze, Kocaeli',        'İzmit, Kocaeli',
  'Başiskele, Kocaeli',  'Pamukkale, Denizli',    'Merkezefendi, Denizli',
  'Melikgazi, Kayseri',  'Kocasinan, Kayseri',    'Altınordu, Ordu',
  'Çorlu, Tekirdağ',     'Ereğli, Konya',
];

// ── Department contextual data — index 0-19 maps to department_id 1-20 ───────

const DEPT = [
  { // 0 → Cardiology (dept 1)
    specs: ['Interventional Cardiology','Clinical Cardiology','Cardiac Electrophysiology',
            'Heart Failure Specialist','Preventive Cardiology'],
    reasons: ['Chest pain and palpitations','Shortness of breath on exertion',
              'Hypertension follow-up visit','Irregular heartbeat complaints','Heart failure monitoring'],
    diagnoses: ['Hypertensive Heart Disease','Coronary Artery Disease',
                'Atrial Fibrillation','Congestive Heart Failure','Stable Angina Pectoris'],
    treatments: ['Antihypertensive therapy initiated','Percutaneous coronary intervention performed',
                 'Rate control therapy adjusted','Diuretic management optimized','Long-acting nitrate prescribed'],
    meds: ['Metoprolol','Ramipril','Atorvastatin','Aspirin','Amlodipine',
           'Bisoprolol','Warfarin','Clopidogrel','Furosemide','Spironolactone'],
    bills: [350,450,600,800,1200,1500,2000],
    radiology: [
      {type:'ECG',part:'Heart',findings:'Sinus rhythm with left ventricular hypertrophy pattern'},
      {type:'Echocardiography',part:'Heart',findings:'Ejection fraction 45%, mild mitral regurgitation'},
      {type:'X-Ray',part:'Chest',findings:'Cardiomegaly with pulmonary vascular congestion'},
    ],
  },
  { // 1 → Neurology (dept 2)
    specs: ['Clinical Neurology','Cerebrovascular Neurology','Epileptology',
            'Movement Disorder Specialist','Headache Medicine'],
    reasons: ['Recurring severe headaches','Dizziness and loss of balance',
              'Memory impairment concerns','Numbness in extremities','Seizure episodes'],
    diagnoses: ["Migraine with Aura","Ischemic Stroke","Temporal Lobe Epilepsy",
                "Parkinson's Disease","Peripheral Neuropathy"],
    treatments: ['Preventive migraine therapy started','Antiplatelet therapy initiated',
                 'Anticonvulsant dosage adjusted','Dopaminergic therapy optimized',
                 'Nerve conduction rehabilitation'],
    meds: ['Sumatriptan','Clopidogrel','Levetiracetam','Levodopa-Carbidopa',
           'Gabapentin','Topiramate','Carbamazepine','Aspirin','Amantadine'],
    bills: [300,450,600,750,1000],
    radiology: [
      {type:'MRI',part:'Brain',findings:'T2 hyperintensities in white matter, demyelination pattern'},
      {type:'CT',part:'Brain',findings:'No acute hemorrhage; age-related cortical atrophy noted'},
      {type:'MRI',part:'Brain',findings:'Acute ischemic infarct in left MCA territory'},
    ],
  },
  { // 2 → Orthopedics (dept 3)
    specs: ['Sports Medicine Orthopedics','Joint Replacement Surgery','Spine Surgery',
            'Pediatric Orthopedics','Hand and Upper Extremity Surgery'],
    reasons: ['Knee pain after physical activity','Lower back pain after lifting',
              'Shoulder injury during sports','Hip joint pain when walking','Wrist pain and swelling'],
    diagnoses: ['Knee Osteoarthritis','Lumbar Disc Herniation','Rotator Cuff Tear',
                'Hip Osteoarthritis','Carpal Tunnel Syndrome'],
    treatments: ['Intra-articular corticosteroid injection','Physiotherapy program initiated',
                 'Arthroscopic repair performed','Total hip replacement recommended',
                 'Carpal tunnel surgical release'],
    meds: ['Diclofenac','Naproxen','Celecoxib','Tramadol','Calcium + Vitamin D',
           'Glucosamine','Methocarbamol','Ibuprofen'],
    bills: [300,400,600,900,1500,2000],
    radiology: [
      {type:'X-Ray',part:'Knee',findings:'Joint space narrowing bilaterally, osteophyte formation'},
      {type:'MRI',part:'Lumbar Spine',findings:'L4-L5 disc herniation with right nerve root compression'},
      {type:'MRI',part:'Shoulder',findings:'Full-thickness rotator cuff tear involving supraspinatus'},
    ],
  },
  { // 3 → Pediatrics (dept 4)
    specs: ['General Pediatrics','Neonatal-Perinatal Medicine','Pediatric Cardiology',
            'Pediatric Gastroenterology','Pediatric Neurology'],
    reasons: ['High fever and sore throat','Persistent cough and wheezing',
              'Ear pain and hearing concern','Growth delay evaluation','Routine childhood vaccination'],
    diagnoses: ['Upper Respiratory Tract Infection','Otitis Media','Acute Gastroenteritis',
                'Failure to Thrive','Allergic Rhinitis'],
    treatments: ['Antibiotic therapy prescribed','Analgesic ear drops administered',
                 'Oral rehydration therapy advised','Nutritional supplementation started',
                 'Allergen avoidance counseling'],
    meds: ['Amoxicillin','Paracetamol','Ibuprofen','Azithromycin','Cetirizine','Folic Acid','Probiotics'],
    bills: [150,200,250,300,400],
    radiology: [
      {type:'X-Ray',part:'Chest',findings:'Bilateral perihilar infiltrates consistent with bronchitis'},
      {type:'Ultrasound',part:'Abdomen',findings:'Mild mesenteric lymphadenopathy, no acute pathology'},
    ],
  },
  { // 4 → Dermatology (dept 5)
    specs: ['Cosmetic Dermatology','Clinical Dermatology','Dermato-Oncology',
            'Pediatric Dermatology','Hair and Nail Disorders'],
    reasons: ['Itchy widespread skin rash','Severe acne breakout',
              'Hair loss and thinning','Suspicious changing skin lesion','Nail discoloration and brittleness'],
    diagnoses: ['Atopic Dermatitis','Acne Vulgaris Grade 3','Alopecia Areata',
                'Seborrheic Dermatitis','Psoriasis Vulgaris'],
    treatments: ['Topical corticosteroid regimen','Oral isotretinoin therapy',
                 'Immunotherapy protocol started','Antifungal treatment course',
                 'Biologic therapy evaluation'],
    meds: ['Betamethasone Cream','Isotretinoin','Minoxidil','Ketoconazole',
           'Methotrexate','Cetirizine','Doxycycline','Adapalene'],
    bills: [200,300,450,600,800],
    radiology: [],
  },
  { // 5 → Ophthalmology (dept 6)
    specs: ['Retinal Surgery','Cornea and Refractive Surgery','Glaucoma Specialist',
            'Pediatric Ophthalmology','Neuro-Ophthalmology'],
    reasons: ['Blurred near and far vision','Eye pain and redness',
              'Gradual central vision loss','Floaters and flashing lights','Dry and irritated eyes'],
    diagnoses: ['Myopia','Primary Open-Angle Glaucoma','Age-Related Macular Degeneration',
                'Dry Eye Syndrome','Diabetic Retinopathy'],
    treatments: ['Corrective prescription provided','IOP-lowering eye drops started',
                 'Anti-VEGF injection administered','Artificial tear therapy optimized',
                 'Laser photocoagulation performed'],
    meds: ['Timolol Eye Drops','Latanoprost','Brimonidine','Artificial Tears','Ranibizumab'],
    bills: [200,350,500,750,1200,1800],
    radiology: [
      {type:'Fundus Photography',part:'Retina',findings:'Cup-to-disc ratio 0.8, suspicious for glaucoma'},
      {type:'OCT',part:'Macula',findings:'Drusen deposits and RPE atrophy consistent with dry AMD'},
    ],
  },
  { // 6 → ENT (dept 7)
    specs: ['Otology and Neurotology','Rhinology','Head and Neck Oncology',
            'Laryngology','Pediatric Otorhinolaryngology'],
    reasons: ['Sinus pain and nasal congestion','Tonsil pain and swallowing difficulty',
              'Progressive hearing loss','Nasal polyps and obstruction','Hoarseness and voice changes'],
    diagnoses: ['Chronic Sinusitis','Tonsillar Hypertrophy','Sensorineural Hearing Loss',
                'Nasal Polyposis','Vocal Cord Nodules'],
    treatments: ['Nasal corticosteroid spray and irrigation','Tonsillectomy evaluation referral',
                 'Hearing aid fitting advised','Endoscopic polypectomy performed','Voice therapy program'],
    meds: ['Fluticasone Nasal Spray','Amoxicillin-Clavulanate','Mometasone',
           'Pseudoephedrine','Cetirizine','Azithromycin'],
    bills: [200,300,400,600,900,1200],
    radiology: [
      {type:'CT',part:'Paranasal Sinuses',
       findings:'Bilateral maxillary and ethmoid opacification consistent with chronic sinusitis'},
    ],
  },
  { // 7 → Gastroenterology (dept 8)
    specs: ['Hepatology','Advanced Endoscopy','Inflammatory Bowel Disease',
            'Motility Disorders','Pancreatic Disease'],
    reasons: ['Epigastric pain and bloating','Heartburn and acid reflux',
              'Chronic diarrhea and cramping','Blood in stool','Jaundice and fatigue'],
    diagnoses: ['Gastroesophageal Reflux Disease','Irritable Bowel Syndrome',
                'Helicobacter Pylori Gastritis','Ulcerative Colitis','Cholelithiasis'],
    treatments: ['Proton pump inhibitor therapy','Low-FODMAP dietary counseling',
                 'H. pylori triple eradication therapy','Mesalazine maintenance therapy',
                 'Cholecystectomy referral'],
    meds: ['Omeprazole','Pantoprazole','Clarithromycin','Mesalazine',
           'Metronidazole','Mebeverine','Simethicone','Amoxicillin'],
    bills: [250,350,500,700,1000,1500],
    radiology: [
      {type:'Ultrasound',part:'Abdomen',
       findings:'Multiple gallstones without cholecystitis, mild hepatomegaly'},
      {type:'CT',part:'Abdomen',
       findings:'Colonic wall thickening in sigmoid consistent with colitis'},
    ],
  },
  { // 8 → Pulmonology (dept 9)
    specs: ['Interventional Pulmonology','Asthma and Allergy','COPD Management',
            'Sleep Medicine','Pulmonary Hypertension'],
    reasons: ['Persistent dry cough for weeks','Shortness of breath on minimal exertion',
              'Wheezing and chest tightness','Night sweats and productive cough','Reduced exercise tolerance'],
    diagnoses: ['Bronchial Asthma','COPD Stage 2','Community-Acquired Pneumonia',
                'Pulmonary Tuberculosis','Pulmonary Embolism'],
    treatments: ['Inhaled corticosteroid/LABA combination','Bronchodilator therapy optimized',
                 'Empirical antibiotic therapy','Anti-TB four-drug regimen',
                 'Anticoagulation therapy initiated'],
    meds: ['Salbutamol','Budesonide-Formoterol','Tiotropium','Amoxicillin-Clavulanate',
           'Rifampicin','Heparin','Theophylline','Doxycycline'],
    bills: [300,400,600,800,1200,1800],
    radiology: [
      {type:'X-Ray',part:'Chest',findings:'Right lower lobe consolidation consistent with pneumonia'},
      {type:'CT',part:'Chest',findings:'Centrilobular emphysema and air trapping consistent with COPD'},
      {type:'CT',part:'Pulmonary Arteries',
       findings:'Filling defect in right pulmonary artery consistent with embolism'},
    ],
  },
  { // 9 → Urology (dept 10)
    specs: ['Urologic Oncology','Female Urology','Kidney Stone Management',
            'Male Infertility','Pediatric Urology'],
    reasons: ['Painful and frequent urination','Severe flank pain radiating to groin',
              'Urinary incontinence','Difficulty urinating and weak stream','Blood in urine'],
    diagnoses: ['Lower Urinary Tract Infection','Renal Lithiasis',
                'Benign Prostatic Hyperplasia','Urinary Stress Incontinence','Hematuria Workup'],
    treatments: ['Antibiotic therapy prescribed','ESWL lithotripsy performed',
                 'Alpha-blocker therapy started','Pelvic floor exercise program','Cystoscopy performed'],
    meds: ['Ciprofloxacin','Trimethoprim-Sulfamethoxazole','Tamsulosin',
           'Finasteride','Oxybutynin','Nitrofurantoin','Ibuprofen'],
    bills: [250,350,500,700,1000,1500],
    radiology: [
      {type:'Ultrasound',part:'Kidneys and Bladder',
       findings:'5mm calculus in right renal pelvis, no hydronephrosis'},
      {type:'CT',part:'Abdomen and Pelvis',
       findings:'Multiple renal calculi, largest 8mm in left proximal ureter'},
    ],
  },
  { // 10 → Psychiatry (dept 11)
    specs: ['Adult Psychiatry','Child and Adolescent Psychiatry','Addiction Medicine',
            'Geriatric Psychiatry','Forensic Psychiatry'],
    reasons: ['Persistent sadness and loss of interest','Anxiety and recurrent panic attacks',
              'Sleep disturbances and insomnia','Mood swings and irritability',
              'Difficulty concentrating and fatigue'],
    diagnoses: ['Major Depressive Disorder','Generalized Anxiety Disorder',
                'Bipolar Disorder Type 1','Post-Traumatic Stress Disorder','Insomnia Disorder'],
    treatments: ['SSRI therapy initiated','CBT referral arranged',
                 'Mood stabilizer therapy adjusted','EMDR therapy program',
                 'Sleep hygiene counseling and melatonin'],
    meds: ['Sertraline','Escitalopram','Lithium Carbonate','Quetiapine',
           'Alprazolam','Mirtazapine','Venlafaxine'],
    bills: [200,300,400,500,600],
    radiology: [],
  },
  { // 11 → Oncology (dept 12)
    specs: ['Medical Oncology','Radiation Oncology','Hematological Oncology',
            'Breast Oncology','Gastrointestinal Oncology'],
    reasons: ['Unexplained weight loss and fatigue','Tumor surveillance follow-up',
              'New breast lump evaluation','Post-chemotherapy side effects','Newly diagnosed malignancy workup'],
    diagnoses: ['Breast Carcinoma Stage 2','Non-Hodgkin Lymphoma',
                'Colon Adenocarcinoma Stage 3','Lung Squamous Cell Carcinoma','Cervical Cancer Stage 1'],
    treatments: ['Adjuvant chemotherapy protocol','R-CHOP immunochemotherapy',
                 'FOLFOX chemotherapy regimen','Platinum-based chemotherapy',
                 'Concurrent chemoradiation'],
    meds: ['Tamoxifen','Doxorubicin','Cyclophosphamide','Capecitabine',
           'Cisplatin','Paclitaxel','Rituximab'],
    bills: [800,1200,1800,2500,3500,5000],
    radiology: [
      {type:'CT',part:'Chest, Abdomen and Pelvis',
       findings:'Mediastinal lymphadenopathy with bilateral pulmonary nodules'},
      {type:'PET-CT',part:'Whole Body',
       findings:'FDG-avid lesions in mediastinum and spleen consistent with lymphoma'},
      {type:'MRI',part:'Breast',
       findings:'5cm irregular enhancing mass in left upper outer quadrant'},
    ],
  },
  { // 12 → Endocrinology (dept 13)
    specs: ['Diabetology','Thyroid Disorders','Adrenal and Pituitary Disorders',
            'Metabolic Bone Disease','Reproductive Endocrinology'],
    reasons: ['Elevated fasting blood glucose','Weight gain and cold intolerance',
              'Thyroid nodule evaluation','Irregular menstrual cycle','Excessive thirst and urination'],
    diagnoses: ['Type 2 Diabetes Mellitus','Hypothyroidism','Polycystic Ovary Syndrome',
                "Cushing's Syndrome",'Osteoporosis'],
    treatments: ['Metformin therapy initiated','Levothyroxine replacement therapy',
                 'Lifestyle modification counseling','GLP-1 receptor agonist added',
                 'Bisphosphonate therapy started'],
    meds: ['Metformin','Insulin Glargine','Levothyroxine','Glipizide',
           'Sitagliptin','Calcium + Vitamin D','Alendronate'],
    bills: [200,300,400,600,900],
    radiology: [
      {type:'Ultrasound',part:'Thyroid',
       findings:'Heterogeneous thyroid with 1.5cm hypoechoic nodule, TI-RADS 4'},
      {type:'Bone Densitometry',part:'Lumbar Spine and Hip',
       findings:'T-score -2.8 consistent with osteoporosis at lumbar spine'},
    ],
  },
  { // 13 → Rheumatology (dept 14)
    specs: ['Clinical Rheumatology','Autoimmune Disease','Vasculitis',
            'Crystalline Arthropathy','Osteoporosis Management'],
    reasons: ['Morning joint stiffness lasting hours','Swollen and painful multiple joints',
              'Butterfly facial rash','Acute gout attack in big toe','Widespread pain and fatigue'],
    diagnoses: ['Rheumatoid Arthritis','Systemic Lupus Erythematosus',
                'Psoriatic Arthritis','Gouty Arthritis','Fibromyalgia Syndrome'],
    treatments: ['Methotrexate therapy initiated','Hydroxychloroquine and steroid taper',
                 'TNF inhibitor therapy started','Colchicine and allopurinol prescribed',
                 'Multimodal pain management'],
    meds: ['Methotrexate','Hydroxychloroquine','Prednisone','Colchicine',
           'Allopurinol','Sulfasalazine','Adalimumab','Ibuprofen'],
    bills: [300,400,600,900,1500],
    radiology: [
      {type:'X-Ray',part:'Hands',
       findings:'Juxta-articular osteopenia with early erosive changes at MCPs'},
      {type:'Ultrasound',part:'Joints',
       findings:'Power Doppler positivity in PIP joints consistent with active synovitis'},
    ],
  },
  { // 14 → Nephrology (dept 15)
    specs: ['Transplant Nephrology','Dialysis Medicine','Glomerular Disease',
            'Hypertensive Kidney Disease','Acute Kidney Injury'],
    reasons: ['Leg and periorbital swelling','Decreased urine output',
              'Fatigue and anemia workup','Kidney function monitoring visit','Proteinuria evaluation'],
    diagnoses: ['Chronic Kidney Disease Stage 3','Nephrotic Syndrome',
                'IgA Nephropathy','Hypertensive Nephrosclerosis','Acute Kidney Injury'],
    treatments: ['ACE inhibitor nephroprotection','Diuretic therapy adjusted',
                 'Immunosuppressive therapy','Dialysis access preparation',
                 'Dietary protein restriction counseling'],
    meds: ['Ramipril','Furosemide','Prednisolone','Calcium Carbonate',
           'Erythropoietin','Sevelamer','Aspirin'],
    bills: [300,450,700,1000,1500,2500],
    radiology: [
      {type:'Ultrasound',part:'Kidneys',findings:'Bilateral small echogenic kidneys consistent with CKD'},
      {type:'CT',part:'Abdomen',findings:'Cortical thinning and parenchymal calcification in both kidneys'},
    ],
  },
  { // 15 → Hematology (dept 16)
    specs: ['Pediatric Hematology','Benign Hematology','Malignant Hematology',
            'Hemostasis and Thrombosis','Bone Marrow Transplantation'],
    reasons: ['Severe fatigue and pallor','Easy bruising and prolonged bleeding',
              'Recurrent infections','Lymph node enlargement','Bone pain and fatigue'],
    diagnoses: ['Iron Deficiency Anemia','Immune Thrombocytopenic Purpura',
                'Acute Myeloid Leukemia','Deep Vein Thrombosis','Sickle Cell Disease'],
    treatments: ['Intravenous iron therapy','IVIG therapy administered',
                 'Induction chemotherapy protocol','Anticoagulation therapy initiated',
                 'Hydroxyurea therapy started'],
    meds: ['Ferrous Sulfate','Vitamin B12','Folic Acid','Warfarin',
           'Hydroxyurea','Prednisolone','Enoxaparin','Aspirin'],
    bills: [300,500,800,1200,2000,3500],
    radiology: [
      {type:'CT',part:'Chest, Abdomen and Pelvis',
       findings:'Splenomegaly with multiple enlarged lymph node stations'},
      {type:'Ultrasound',part:'Abdomen',
       findings:'Hepatosplenomegaly with portal hypertension features'},
    ],
  },
  { // 16 → Infectious Diseases (dept 17)
    specs: ['Tropical Medicine','HIV/AIDS Medicine','Travel Medicine',
            'Antimicrobial Stewardship','Immunocompromised Host'],
    reasons: ['Prolonged fever of unknown origin','Suspected HIV exposure',
              'Travel-related illness on return','Recurrent opportunistic infections',
              'Skin and soft tissue infection'],
    diagnoses: ['Community-Acquired Pneumonia','HIV Positive Initial Diagnosis',
                'Falciparum Malaria','Cellulitis with Lymphangitis','Pulmonary Tuberculosis'],
    treatments: ['Broad-spectrum antibiotic therapy','Antiretroviral therapy initiation',
                 'Artemisinin combination therapy','IV antibiotics and wound care',
                 'Anti-TB four-drug regimen'],
    meds: ['Amoxicillin-Clavulanate','Tenofovir-Emtricitabine','Chloroquine',
           'Clindamycin','Rifampicin','Isoniazid','Doxycycline','Ciprofloxacin'],
    bills: [250,400,600,900,1500],
    radiology: [
      {type:'X-Ray',part:'Chest',findings:'Right middle lobe infiltrate consistent with pneumonia'},
      {type:'CT',part:'Chest',findings:'Miliary nodules throughout both lung fields, TB pattern'},
    ],
  },
  { // 17 → General Surgery (dept 18)
    specs: ['Minimally Invasive Surgery','Colorectal Surgery','Hepatobiliary Surgery',
            'Breast Surgery','Trauma Surgery'],
    reasons: ['Right lower quadrant abdominal pain','Right upper quadrant pain after fatty meals',
              'Bulge in groin area','Breast lump evaluation','Abdominal wall hernia discomfort'],
    diagnoses: ['Acute Appendicitis','Cholelithiasis with Cholecystitis',
                'Inguinal Hernia','Breast Fibroadenoma','Umbilical Hernia'],
    treatments: ['Laparoscopic appendectomy performed','Laparoscopic cholecystectomy performed',
                 'Tension-free mesh hernia repair','Excisional biopsy performed',
                 'Open herniorrhaphy procedure'],
    meds: ['Metronidazole','Cefazolin','Tramadol','Heparin','Ibuprofen','Paracetamol','Omeprazole'],
    bills: [500,800,1200,2000,3000,4000],
    radiology: [
      {type:'Ultrasound',part:'Abdomen',
       findings:'Acute appendicitis with periappendiceal fat stranding'},
      {type:'CT',part:'Abdomen',
       findings:'Distended gallbladder with wall thickening and pericholecystic fluid'},
    ],
  },
  { // 18 → OB/GYN (dept 19)
    specs: ['Maternal-Fetal Medicine','Reproductive Endocrinology','Gynecological Oncology',
            'Urogynecology','General OB/GYN'],
    reasons: ['Missed period and positive pregnancy test','Pelvic pain and dysmenorrhea',
              'Abnormal uterine bleeding','Infertility evaluation','Routine cervical screening'],
    diagnoses: ['Intrauterine Pregnancy 10 Weeks','Ovarian Cyst',
                'Endometriosis Stage 2','Cervical Dysplasia CIN1','Polycystic Ovary Syndrome'],
    treatments: ['Prenatal care protocol initiated','Expectant management with follow-up',
                 'Laparoscopic endometriosis ablation','Colposcopy and directed biopsy',
                 'Clomiphene induction therapy'],
    meds: ['Folic Acid','Progesterone','Iron + Folic Acid','Estradiol',
           'Clomiphene','Metformin','Mifepristone'],
    bills: [250,350,500,700,1000,1500],
    radiology: [
      {type:'Ultrasound',part:'Pelvis',
       findings:'8.5cm simple ovarian cyst on right ovary, no internal echoes'},
      {type:'Ultrasound',part:'Uterus',
       findings:'Intrauterine pregnancy, crown-rump length 3.2cm, normal fetal heart activity'},
    ],
  },
  { // 19 → Physical Therapy (dept 20)
    specs: ['Musculoskeletal Rehabilitation','Neurological Rehabilitation',
            'Cardiopulmonary Rehabilitation','Sports Rehabilitation','Pediatric Physical Therapy'],
    reasons: ['Post-operative knee rehabilitation','Chronic lower back pain management',
              'Shoulder mobility restriction','ACL repair recovery program',
              'Post-stroke motor rehabilitation'],
    diagnoses: ['Post-Total Knee Arthroplasty Rehabilitation','Chronic Non-Specific Low Back Pain',
                'Adhesive Capsulitis','Post-ACL Reconstruction Rehabilitation',
                'Post-Stroke Hemiplegia'],
    treatments: ['Progressive strengthening protocol','Manual therapy and therapeutic exercise',
                 'Pendulum and ROM exercises','Functional movement training',
                 'Neuromuscular re-education'],
    meds: ['Diclofenac','Methocarbamol','Ibuprofen','Cyclobenzaprine','Tramadol','Paracetamol'],
    bills: [150,200,300,400,500],
    radiology: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const p2 = n => String(n).padStart(2, '0');
const p3 = n => String(n).padStart(3, '0');
const p4 = n => String(n).padStart(4, '0');
const at = (arr, i) => arr[i % arr.length];

function genPhone(seed) {
  const pfx = ['530','531','532','533','534','535','536','537',
               '541','542','543','544','545','546','547','548',
               '551','552','553','554','555','556','557','558'];
  return `+90 ${pfx[seed % pfx.length]} ${p3(100 + Math.floor(seed / pfx.length) % 900)} ${p4(seed % 10000)}`;
}

function randomWeekday(start, end) {
  let d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  if (day === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
  return d;
}

function fmtDT(date, time) {
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())} ${time}:00`;
}

function fmtDate(date) {
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`;
}

// INSERT IGNORE in chunks of chunkSize rows
async function batchInsert(db, sql, rows, chunkSize = 200) {
  if (rows.length === 0) return;
  const colCount = rows[0].length;
  const ph = '(' + Array(colCount).fill('?').join(',') + ')';
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await db.execute(`${sql} ${chunk.map(() => ph).join(',')}`, chunk.flat());
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to database…');
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'hospital_db',
  });

  console.log('Hashing default password (this takes a moment)…');
  const HASH = await bcrypt.hash('123456', 10);

  // ── 1. PATIENT USERS + PATIENT RECORDS ──────────────────────────────────────
  console.log('Inserting 1000 patients…');
  const pUserRows  = [];
  const patRows    = [];

  for (let i = 1; i <= 1000; i++) {
    const uid   = 1100 + i;                        // user_id 1101-2100
    const pid   = 1000 + i;                        // patient_id 1001-2000
    const email = `patient${p3(i)}@test.com`;
    const isMale = (i % 3) !== 0;                  // ~67 % male, ~33 % female
    const fname = isMale ? at(M, i * 3) : at(F, i * 3);
    const lname = at(SN, i * 7 + 13);
    const birthYear = 1950 + ((i * 17 + 3) % 57); // ages 20-75
    const dob   = `${birthYear}-${p2(1 + i % 12)}-${p2(1 + i % 28)}`;
    const gender = isMale ? 'Male' : 'Female';
    const phone = genPhone(i + 5000);
    const addr  = at(ADDRS, i);

    pUserRows.push([uid, email, HASH, 'PATIENT', '2025-06-01 09:00:00']);
    patRows.push([pid, uid, fname, lname, dob, gender, phone, email, addr, '2025-06-01 09:00:00']);
  }

  await batchInsert(db,
    'INSERT IGNORE INTO users (id,email,password,role,created_at) VALUES',
    pUserRows);
  await batchInsert(db,
    'INSERT IGNORE INTO Patients (patient_id,user_id,first_name,last_name,date_of_birth,gender,phone,email,address,created_at) VALUES',
    patRows);

  // ── 2. DOCTOR USERS + DOCTOR RECORDS + DEPT ASSIGNMENTS ─────────────────────
  console.log('Inserting 100 doctors…');
  const dUserRows  = [];
  const docRows    = [];
  const deptRows   = [];

  for (let i = 1; i <= 100; i++) {
    const uid    = 1000 + i;                       // user_id 1001-1100
    const did    = 100  + i;                       // doctor_id 101-200
    const email  = `doctor${p3(i)}@test.com`;
    const deptIdx = Math.floor((i - 1) / 5);       // 0-19 → dept 1-20
    const specIdx = (i - 1) % 5;
    const dept   = DEPT[deptIdx];
    const spec   = dept.specs[specIdx];
    const deptId = deptIdx + 1;
    const isMale = i % 2 === 1;
    const fname  = isMale ? at(M, i * 11) : at(F, i * 11);
    const lname  = at(SN, i * 13 + 5);
    const phone  = genPhone(i + 200);
    const bio    = `${spec} specialist with extensive clinical and research experience.`;

    dUserRows.push([uid, email, HASH, 'DOCTOR', '2025-01-02 09:00:00']);
    docRows.push([did, uid, fname, lname, spec, phone, email, bio, '2025-01-02 09:00:00']);
    deptRows.push([did, deptId]);
  }

  await batchInsert(db,
    'INSERT IGNORE INTO users (id,email,password,role,created_at) VALUES',
    dUserRows);
  await batchInsert(db,
    'INSERT IGNORE INTO Doctors (doctor_id,user_id,first_name,last_name,specialization,phone,email,bio,created_at) VALUES',
    docRows);
  await batchInsert(db,
    'INSERT IGNORE INTO Doctor_Departments (doctor_id,department_id) VALUES',
    deptRows);

  // ── 3. DOCTOR SCHEDULES (Mon-Fri, 09:00-17:00) ───────────────────────────────
  console.log('Inserting doctor schedules…');
  const schedRows = [];
  for (let i = 1; i <= 100; i++) {
    for (let day = 1; day <= 5; day++) {
      schedRows.push([100 + i, day, '09:00:00', '17:00:00']);
    }
  }
  await batchInsert(db,
    'INSERT IGNORE INTO doctor_schedules (doctor_id,day_of_week,start_time,end_time) VALUES',
    schedRows);

  // ── 4. APPOINTMENTS ──────────────────────────────────────────────────────────
  console.log('Generating appointments…');

  const SLOTS = [
    '09:00','09:20','09:40','10:00','10:20','10:40',
    '11:00','11:20','11:40','13:00','13:20','13:40',
    '14:00','14:20','14:40','15:00','15:20','15:40',
    '16:00','16:20','16:40',
  ];

  const PAST_START = new Date('2025-09-01');
  const PAST_END   = new Date('2026-06-04');
  const FUT_START  = new Date('2026-06-10');
  const FUT_END    = new Date('2026-08-29');

  const usedSlots = new Set();
  const apptRows  = [];
  let apptId = 1001;

  function tryAppt(patientId) {
    for (let t = 0; t < 40; t++) {
      const docOffset = Math.floor(Math.random() * 100);
      const doctorId  = 101 + docOffset;
      const deptIdx   = Math.floor(docOffset / 5);
      const dept      = DEPT[deptIdx];

      const isPast = Math.random() < 0.70;
      const date   = randomWeekday(
        isPast ? PAST_START : FUT_START,
        isPast ? PAST_END   : FUT_END
      );
      const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
      const dt   = fmtDT(date, slot);
      const key  = `${doctorId}_${dt}`;

      if (!usedSlots.has(key)) {
        usedSlots.add(key);
        let status;
        if (isPast) {
          const r = Math.random();
          status = r < 0.10 ? 'Cancelled' : r < 0.15 ? 'No_Show' : 'Completed';
        } else {
          status = 'Scheduled';
        }
        const createdOffset = (2 + Math.floor(Math.random() * 7)) * 86400000;
        const created = new Date(date.getTime() - createdOffset);
        apptRows.push([
          apptId++, patientId, doctorId, dt, 20,
          at(dept.reasons, Math.floor(Math.random() * dept.reasons.length)),
          status,
          fmtDT(created, '10:00'),
        ]);
        return true;
      }
    }
    return false; // no free slot found after 40 attempts (very unlikely)
  }

  // 450 patients with 1 appointment, 100 patients with 2 → ~650 appointments
  for (let p = 1001; p <= 1450; p++) tryAppt(p);
  for (let p = 1451; p <= 1550; p++) { tryAppt(p); tryAppt(p); }

  console.log(`Inserting ${apptRows.length} appointments…`);
  await batchInsert(db,
    'INSERT IGNORE INTO Appointments (appointment_id,patient_id,doctor_id,appointment_date,duration,reason,status,created_at) VALUES',
    apptRows);

  // ── 5. MEDICATIONS ───────────────────────────────────────────────────────────
  console.log('Inserting medications…');
  const allMedNames = [...new Set(DEPT.flatMap(d => d.meds))];
  await batchInsert(db,
    'INSERT IGNORE INTO Medications (name) VALUES',
    allMedNames.map(n => [n]));

  const [medRows] = await db.execute('SELECT medication_id, name FROM Medications');
  const medMap = {};
  for (const r of medRows) medMap[r.name] = r.medication_id;

  // ── 6. BILLING + MEDICAL RECORDS + PRESCRIPTIONS + RADIOLOGY ─────────────────
  console.log('Inserting billing, medical records, prescriptions, radiology…');

  const billingRows  = [];
  const medRecRows   = [];
  const prescRows    = [];
  const radioRows    = [];

  const DOSAGES   = ['10mg','20mg','25mg','50mg','100mg','200mg','250mg','400mg','500mg','1000mg'];
  const DURATIONS = ['5 days','7 days','10 days','14 days','21 days','30 days','60 days','90 days'];

  let billId  = 1001;
  let mrId    = 1001;
  let prescId = 1001;
  let radioId = 1001;

  for (const appt of apptRows) {
    const [apptIdVal, patientId, doctorId, dt, , , status] = appt;
    const deptIdx = Math.floor((doctorId - 101) / 5);
    const dept    = DEPT[deptIdx];
    const apptDate = dt.split(' ')[0];

    // Billing for every appointment
    const amount = at(dept.bills, Math.floor(Math.random() * dept.bills.length));
    let payStatus;
    if (status === 'Cancelled' || status === 'No_Show') {
      payStatus = 'Failed';
    } else if (status === 'Scheduled') {
      payStatus = 'Pending';
    } else {
      payStatus = Math.random() < 0.65 ? 'Paid' : 'Pending';
    }
    billingRows.push([billId++, apptIdVal, amount.toFixed(2), payStatus, apptDate]);

    if (status !== 'Completed') continue;

    // Medical record for every completed appointment
    const diagIdx  = Math.floor(Math.random() * dept.diagnoses.length);
    const treatIdx = Math.floor(Math.random() * dept.treatments.length);
    const recordId = mrId++;
    medRecRows.push([
      recordId, apptIdVal, patientId, doctorId,
      dept.diagnoses[diagIdx], dept.treatments[treatIdx], apptDate,
    ]);

    // Prescriptions: ~70 % of completed appointments, 1-2 medications
    if (Math.random() < 0.70) {
      const numMeds  = Math.random() < 0.40 ? 2 : 1;
      const shuffled = [...dept.meds].sort(() => Math.random() - 0.5);
      for (let m = 0; m < Math.min(numMeds, shuffled.length); m++) {
        const medId = medMap[shuffled[m]];
        if (medId) {
          prescRows.push([
            prescId++, recordId, medId,
            at(DOSAGES, prescId),
            at(DURATIONS, m),
          ]);
        }
      }
    }

    // Radiology: ~20 % of completed appointments in departments that have imaging
    if (dept.radiology.length > 0 && Math.random() < 0.20) {
      const rad = dept.radiology[Math.floor(Math.random() * dept.radiology.length)];
      radioRows.push([
        radioId++, apptIdVal, patientId, doctorId,
        rad.type, rad.part, null, rad.findings, apptDate,
      ]);
    }
  }

  await batchInsert(db,
    'INSERT IGNORE INTO Billing (bill_id,appointment_id,total_amount,payment_status,billing_date) VALUES',
    billingRows);
  await batchInsert(db,
    'INSERT IGNORE INTO MedicalRecords (record_id,appointment_id,patient_id,doctor_id,diagnosis,treatment,record_date) VALUES',
    medRecRows);
  await batchInsert(db,
    'INSERT IGNORE INTO Prescriptions (prescription_id,record_id,medication_id,dosage,duration) VALUES',
    prescRows);
  await batchInsert(db,
    'INSERT IGNORE INTO RadiologicalResults (result_id,appointment_id,patient_id,doctor_id,image_type,body_part,image_url,findings,result_date) VALUES',
    radioRows);

  await db.end();

  console.log('\n✓ Mock data generation complete!');
  console.log(`  Patients inserted       : 1000  (patient001@test.com … patient1000@test.com)`);
  console.log(`  Doctors inserted        : 100   (doctor001@test.com  … doctor100@test.com)`);
  console.log(`  Doctor schedules        : ${schedRows.length}  (100 doctors × Mon-Fri, 09:00-17:00)`);
  console.log(`  Appointments generated  : ${apptRows.length}`);
  console.log(`  Billing rows            : ${billingRows.length}`);
  console.log(`  Medical records         : ${medRecRows.length}`);
  console.log(`  Prescriptions           : ${prescRows.length}`);
  console.log(`  Radiology results       : ${radioRows.length}`);
  console.log(`\n  Default password for all new accounts: 123456`);
  console.log(`  Existing test accounts are untouched.`);
}

main().catch(err => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
