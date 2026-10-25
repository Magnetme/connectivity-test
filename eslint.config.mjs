import {fixupPluginRules} from '@eslint/compat';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
	{ignores: ['build/**', 'coverage/**']},
	{
		files: ['**/*.{js,jsx,mjs}'],
		languageOptions: {
			globals: {...globals.browser, ...globals.node},
			parserOptions: {ecmaFeatures: {jsx: true}},
		},
		plugins: {react: fixupPluginRules(react), 'jsx-a11y': fixupPluginRules(jsxA11y)},
		settings: {react: {version: 'detect'}},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...jsxA11y.configs.recommended.rules,
			'no-unused-vars': ['error', {caughtErrors: 'none'}],
			'react/prop-types': 'off',
		},
	},
	{
		files: ['**/*.test.{js,jsx}'],
		rules: {'react/display-name': 'off'},
	},
];
