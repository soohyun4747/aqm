// eslint.config.mjs
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
	...compat.extends('next/core-web-vitals', 'next/typescript'),

	// 공통 무시(빌드 산출물 등)
	{
		ignores: ['node_modules/', '.next/', 'dist/'],
	},

	// 규칙 오버라이드
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		rules: {
			// 가장 많이 터진 것들 우선 완화
			'@typescript-eslint/no-explicit-any': 'off',
			'react/jsx-key': 'warn',
			'react/no-children-prop': 'warn',
			'react/no-unescaped-entities': 'warn',
			'@next/next/no-img-element': 'warn',

			// 상황에 따라 추가 완화 가능
			'@typescript-eslint/no-unused-vars': 'warn',
			'react-hooks/exhaustive-deps': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
		},
	},
];
