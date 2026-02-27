type User = { name: string; email: string; passwordHash: string };

const USERS_KEY = "removix.users";
const SESSION_KEY = "removix.session";

async function sha256(text: string) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export async function registerUser(name: string, email: string, password: string) {
  const users = loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email already registered");
  const passwordHash = await sha256(password);
  users.push({ name, email, passwordHash });
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  return { name, email };
}

export async function loginUser(email: string, password: string) {
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Invalid email or password");
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error("Invalid email or password");
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  return { name: user.name, email: user.email };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { email } = JSON.parse(raw) as { email: string };
    const users = loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return null;
    return { name: user.name, email: user.email };
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
