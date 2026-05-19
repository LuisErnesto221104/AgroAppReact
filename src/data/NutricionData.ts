import type {
  EtapaProductiva,
  TipoAnimal,
  RecomendacionNutricional,
} from '../types/Nutricion';

// Fuentes: NRC (Nutrient Requirements of Beef Cattle, 2016) e INIFAP
const TABLAS_NUTRICION: Record<EtapaProductiva, Record<TipoAnimal, RecomendacionNutricional>> = {
  CRIA: {
    BOVINO: {
      etapa: 'CRIA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 18,
      energiaMcal: 2.6,
      fibraMaxima: 35,
      aguaLitrosDia: 8,
      suplementos: [
        'Calostro primeras 6 horas (3–4 L)',
        'Vitamina E 150–200 UI/día',
        'Selenio 0.1 mg/kg MS',
        'Vitamina A 2200 UI/kg MS',
        'Coccidiostático (monensina) a partir de 4a semana',
      ],
      observaciones:
        'Terneros en lactancia: leche entera o sustituto lácteo (12–15% grasa, 24% proteína). Introducir forraje de calidad desde la 2a semana. Destete entre 60–90 días. Evitar estrés térmico. INIFAP recomienda pesaje semanal para ajuste de suministro.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1400,
        fuente: 'INIFAP 2023 — Región Centro-Norte',
      },
    },
    OVINO: {
      etapa: 'CRIA',
      tipoAnimal: 'OVINO',
      proteinaMin: 20,
      energiaMcal: 2.7,
      fibraMaxima: 30,
      aguaLitrosDia: 2,
      suplementos: [
        'Calostro 200 mL/kg PV en primeras 12 h',
        'Vitamina E + Selenio (BoSe®)',
        'Hierro dextrano IM 150 mg a los 3 días',
        'Coccidiostático desde 3a semana',
      ],
      observaciones:
        'Corderos: leche materna o sustituto (3× al día). Destete a 45–60 días. Ofrecer concentrado de arranque 18% PC desde 2a semana. NRC Sheep 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 650,
        fuente: 'INIFAP 2023 — Bajío',
      },
    },
    CAPRINO: {
      etapa: 'CRIA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 20,
      energiaMcal: 2.8,
      fibraMaxima: 28,
      aguaLitrosDia: 1.5,
      suplementos: [
        'Calostro caprino 150–200 mL/kg PV',
        'Vitamina D3 si hay confinamiento total',
        'Coccidiostático (amprolium) semana 3–6',
        'Cobre quelado 10 mg/kg MS',
      ],
      observaciones:
        'Cabritos: lactar mínimo 6 semanas. Introducir heno de alfalfa picado a 2a semana. Cuidado con exceso de cobre en praderas húmedas. NRC Dairy Goat 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 500,
        fuente: 'INIFAP 2022 — Zona árida',
      },
    },
  },

  ENGORDA: {
    BOVINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 13,
      energiaMcal: 3.1,
      fibraMaxima: 20,
      aguaLitrosDia: 35,
      suplementos: [
        'Monensina 200–360 mg/animal/día',
        'Tilosina si hay riesgo hepático',
        'Vitamina A 2200 UI/kg MS',
        'Zinc metionina 50 mg/kg MS',
        'Buffer (NaHCO₃) 0.75% en raciones altas en grano',
      ],
      observaciones:
        'Adaptar grano en 21 días (15%→80% en dieta). Consumo esperado 2.5–3% PV en MS. GDP objetivo: 1.2–1.5 kg/día. Revisar pH ruminal. NRC Beef 2016.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 3200,
        fuente: 'INIFAP 2023 — Sonora / Chihuahua',
      },
    },
    OVINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'OVINO',
      proteinaMin: 14,
      energiaMcal: 3.0,
      fibraMaxima: 22,
      aguaLitrosDia: 5,
      suplementos: [
        'Monensina 15–25 mg/kg MS',
        'Amonio propionato en dietas altas en grano',
        'Vitamina E 30 UI/kg MS',
        'Azufre 0.15% MS (limitar en agua dura)',
      ],
      observaciones:
        'GDP esperada: 250–350 g/día. Peso de sacrificio: 35–45 kg PV. Adaptar concentrado en 14 días. Evitar urolitiasis (relación Ca:P 2:1). NRC Sheep 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 900,
        fuente: 'INIFAP 2023 — Altiplano',
      },
    },
    CAPRINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 14,
      energiaMcal: 2.9,
      fibraMaxima: 25,
      aguaLitrosDia: 4,
      suplementos: [
        'Biotina 2 mg/día en engorda intensiva',
        'Vitamina E 50 UI/kg MS',
        'Selenio orgánico 0.3 mg/kg MS',
        'Rumensin (monensina) 15 mg/kg MS',
      ],
      observaciones:
        'GDP esperada: 150–200 g/día. Peso sacrificio: 25–35 kg. Alta eficiencia de conversión (4.5:1). Forrajear mínimo 20% FDN. NRC Small Ruminants 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 750,
        fuente: 'INIFAP 2022 — Semárido',
      },
    },
  },

  LECHERA: {
    BOVINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 17,
      energiaMcal: 3.2,
      fibraMaxima: 28,
      aguaLitrosDia: 80,
      suplementos: [
        'Calcio 0.7% MS (preparto 0.3% MS)',
        'Fósforo 0.4% MS',
        'Niacina 6 g/vaca/día (pico de lactancia)',
        'Propilenglicol 300 mL/día semana preparto',
        'Selenio + Vitamina E IM 10 días antes del parto',
        'Bypass fat si producción > 30 L/día',
      ],
      observaciones:
        'Ración total mezclada (RTM) óptima. Relación forraje:concentrado 55:45 en pico de lactancia. Monitorear BCS: 3.0–3.5 al parto. NRC Dairy 2021. Adaptar si raza: Holstein > Jersey en requerimientos.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 5500,
        fuente: 'INIFAP 2023 — Jalisco / Coahuila',
      },
    },
    OVINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'OVINO',
      proteinaMin: 16,
      energiaMcal: 2.9,
      fibraMaxima: 30,
      aguaLitrosDia: 6,
      suplementos: [
        'Calcio 0.5% MS',
        'Vitamina D3 500 UI/kg MS en estabulación',
        'Cobre 7–11 mg/kg MS',
        'Zinc 50 mg/kg MS',
        'Concentrado energético 400–600 g/día en pico',
      ],
      observaciones:
        'Producción media: 0.8–1.5 L/día (razas Churra, Manchega). Ordeño 1–2 veces/día. Ofrecer heno de alfalfa ad libitum. Cuidado con hipocalcemia posparto. INIFAP Oaxaca 2021.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1100,
        fuente: 'INIFAP 2021 — Sur-Sureste',
      },
    },
    CAPRINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 16,
      energiaMcal: 3.0,
      fibraMaxima: 30,
      aguaLitrosDia: 8,
      suplementos: [
        'Calcio 0.45% MS',
        'Fósforo 0.35% MS',
        'Vitamina E 50 UI/kg MS',
        'Cobre 10–15 mg/kg MS (precaución raza Saanen)',
        'Concentrado 300–500 g por litro de leche adicional',
      ],
      observaciones:
        'Producción media: 2–4 L/día (razas Saanen, Nubia). Dos ordeños/día. Riesgo de hipocalcemia y acetonemia en pico. Pastoreo complementario reduce costos 30%. NRC Dairy Goat 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1300,
        fuente: 'INIFAP 2023 — Semárido Norte',
      },
    },
  },
};

export function getRecomendacion(
  etapa: EtapaProductiva,
  tipoAnimal: TipoAnimal,
): RecomendacionNutricional {
  return TABLAS_NUTRICION[etapa][tipoAnimal];
}

export { TABLAS_NUTRICION };
