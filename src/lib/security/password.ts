import zxcvbn from "zxcvbn";

const MIN_LENGTH = 12;

const REQUIRED_PATTERNS = [
  { regex: /[A-Z]/, message: "Include at least one uppercase letter." },
  { regex: /[a-z]/, message: "Include at least one lowercase letter." },
  { regex: /\d/, message: "Include at least one number." },
  { regex: /[^A-Za-z0-9]/, message: "Include at least one special character." },
] as const;

export interface PasswordStrengthResult {
  score: number;
  isStrong: boolean;
  suggestions: string[];
}

export const PASSWORD_REQUIREMENTS = {
  minLength: MIN_LENGTH,
  hints: REQUIRED_PATTERNS.map((pattern) => pattern.message),
} as const;

const normalizeSuggestions = (suggestions: string[]): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const suggestion of suggestions) {
    const trimmed = suggestion.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
};

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const safePassword = password ?? "";

  if (!safePassword) {
    return {
      score: 0,
      isStrong: false,
      suggestions: normalizeSuggestions([
        "Password is required.",
        `Use at least ${MIN_LENGTH} characters.`,
      ]),
    };
  }

  const patternSuggestions = REQUIRED_PATTERNS.filter((pattern) => !pattern.regex.test(safePassword)).map(
    (pattern) => pattern.message,
  );
  const meetsLength = safePassword.length >= MIN_LENGTH;
  const lengthSuggestions = meetsLength ? [] : [`Use at least ${MIN_LENGTH} characters.`];

  const { score, feedback } = zxcvbn(safePassword);

  const combinedSuggestions = normalizeSuggestions([
    ...lengthSuggestions,
    ...patternSuggestions,
    ...(feedback.warning ? [feedback.warning] : []),
    ...feedback.suggestions,
  ]);

  const isStrong = score >= 3 && meetsLength && patternSuggestions.length === 0;

  return {
    score,
    isStrong,
    suggestions: isStrong ? [] : combinedSuggestions,
  };
}
