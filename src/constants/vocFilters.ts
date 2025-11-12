export const VocFilterTypes = {
        embryoShield: 'embryo_shield',
        embryoShieldMild: 'embryo_shield_mild',
} as const;

export type VocFilterType = (typeof VocFilterTypes)[keyof typeof VocFilterTypes];

export const VocFilterLabels: Record<VocFilterType, string> = {
        [VocFilterTypes.embryoShield]: '엠브리오 쉴드',
        [VocFilterTypes.embryoShieldMild]: '엠브리오 쉴드 (마일드)',
};

export const vocFilterSpecs: Record<
        VocFilterType,
        { width: number; height: number; depth: number }
> = {
        [VocFilterTypes.embryoShield]: { width: 200, height: 100, depth: 50 },
        [VocFilterTypes.embryoShieldMild]: { width: 200, height: 100, depth: 50 },
};

export const defaultVocFilterType: VocFilterType = VocFilterTypes.embryoShield;

export function buildVocFilterOptions() {
        return Object.entries(VocFilterLabels).map(([value, label]) => ({
                value,
                label,
        }));
}
