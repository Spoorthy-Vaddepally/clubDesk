import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export type Role = 'student' | 'club_head';

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: Role;
  clubName?: string;
  establishedYear?: string;
  domain?: string;
  motto?: string;
  description?: string;
  contact?: string;
  instagram?: string;
  linkedin?: string;
  logoURL?: string;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  [key: string]: any; // for extra fields like clubName etc
}

interface AuthContextType {
  user: AppUser | null;
  register: (
    name: string,
    email: string,
    password: string,
    role: Role,
    clubData?: Omit<RegisterParams, 'name' | 'email' | 'password' | 'role'>
  ) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user data from Firestore based on uid and set in state
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const uid = firebaseUser.uid;
      // Check users collection
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          uid,
          name: data.name,
          email: data.email,
          role: 'student',
          avatar: data.avatar || '',
          ...data
        });
        return 'student';
      }

      // Check clubs collection
      const clubDoc = await getDoc(doc(db, 'clubs', uid));
      if (clubDoc.exists()) {
        const data = clubDoc.data();
        setUser({
          uid,
          name: data.name,
          email: data.email,
          role: 'club_head',
          avatar: data.logoURL || '',
          ...data
        });
        return 'club_head';
      }

      // If no doc found, clear user
      setUser(null);
      return null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUser(null);
      return null;
    }
  };

  // On mount: listen to auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    role: Role,
    clubData?: Omit<RegisterParams, 'name' | 'email' | 'password' | 'role'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (!firebaseUser) throw new Error('User not created');

      if (role === 'student') {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name,
          email,
          role,
          createdAt: serverTimestamp()
        });
      } else if (role === 'club_head' && clubData) {
        await setDoc(doc(db, 'clubs', firebaseUser.uid), {
          name,
          email,
          role,
          clubName: clubData.clubName,
          establishedYear: clubData.establishedYear,
          domain: clubData.domain,
          motto: clubData.motto,
          description: clubData.description,
          contact: clubData.contact || '',
          instagram: clubData.instagram || '',
          linkedin: clubData.linkedin || '',
          logoURL: clubData.logoURL || '',
          createdAt: serverTimestamp()
        });
      }

      await fetchUserData(firebaseUser); // update user state
      return userCredential;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<Role> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await fetchUserData(userCredential.user);
      if (!role) throw new Error('User role not found.');
      return role;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <>Loading...</>; // or a spinner component, until user state is resolved
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
