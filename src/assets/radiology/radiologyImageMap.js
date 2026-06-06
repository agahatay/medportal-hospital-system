import chestXray01    from './chest-xray-01.jpg';
import chestXray02    from './chest-xray-02.jpg';
import ctChest01      from './ct-chest-01.jpg';
import cardiacCt01    from './cardiac-ct-01.jpg';
import coronaryAngio01 from './coronary-angio-01.jpg';
import brainMri01     from './brain-mri-01.jpg';

// Primary mapping: result_id → imported image URL
// Covers the 6 seeded radiological records (add_radiology.sql result_ids 1–6).
const BY_ID = {
    1: chestXray01,
    2: chestXray02,
    3: ctChest01,
    4: cardiacCt01,
    5: coronaryAngio01,
    6: brainMri01,
};

// Fallback mapping: image_type → imported image URL
// Used when result_id is not in BY_ID (future records, different seeds, etc.)
const BY_TYPE = {
    'X-Ray':                chestXray01,
    'CT Scan':              ctChest01,
    'MRI':                  brainMri01,
    'Brain MRI':            brainMri01,
    'Coronary Angiography': coronaryAngio01,
    'Echocardiography':     cardiacCt01,
    'ECG':                  chestXray02,
    'Ultrasound':           cardiacCt01,
};

/**
 * Returns the resolved local image URL for a radiology result.
 * Checks result_id first, then image_type, then returns null.
 */
export function resolveRadiologyImage(result) {
    return BY_ID[result?.result_id] ?? BY_TYPE[result?.image_type] ?? null;
}

export { chestXray01, chestXray02, ctChest01, cardiacCt01, coronaryAngio01, brainMri01 };
