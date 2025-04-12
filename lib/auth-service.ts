import type { User } from "./types"

// Mock user database
const users: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123", // In a real app, this would be hashed
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
  },
]

// In a real app, this would be a server-side API call
export async function registerUser(userData: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<User> {
  // Check if user already exists
  const existingUser = users.find((user) => user.email === userData.email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Create new user
  const newUser: User = {
    id: String(users.length + 1),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password, // In a real app, this would be hashed
    phone: "",
    address: "",
  }

  // Add to mock database
  users.push(newUser)

  // Return user without password
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword as User
}

// In a real app, this would be a server-side API call
export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<User> {
  // Find user
  const user = users.find((user) => user.email === credentials.email && user.password === credentials.password)

  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword as User
}

// In a real app, this would be a server-side API call
export async function updateUserProfile(userData: Partial<User>): Promise<User> {
  // Find user
  const userIndex = users.findIndex((user) => user.email === userData.email)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...userData,
  }

  // Return user without password
  const { password, ...userWithoutPassword } = users[userIndex]
  return userWithoutPassword as User
}
