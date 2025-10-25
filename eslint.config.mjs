// eslint.config.mjs
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Next의 기존(eslintrc 기반) 프리셋을 Flat으로 호환
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
	// Next 권장 + TS 권장
	...compat.extends('next/core-web-vitals', 'next/typescript'),

	// 규칙 오버라이드 (TS 파일에만 적용)
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	// 선택: 빌드 스크립트나 config 폴더는 린트 제외하고 싶을 때
	{
		ignores: [
			'node_modules/',
			'.next/',
			'dist/',
			// 필요하면 추가
			// "scripts/**",
		],
	},
];
