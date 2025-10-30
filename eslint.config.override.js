// Temporary override for third-party UI components with linting warnings
// These components are from shadcn/ui and should not be modified
export default [
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
];
