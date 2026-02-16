'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Package,
  Repeat,
  FlaskConical,
  BarChart
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const i = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const disabled = !username.trim() || !password || loading;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!res.ok) throw new Error();

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-cyan-100" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2 gap-10 px-4">

        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">

          <div>
            <div className="flex items-center gap-4">
              <Image src="/logo-pt.jpg" alt="HT" width={120} height={50} priority />
              <h1 className="text-3xl font-bold text-slate-800">
                PT. Hang Tong Manufactory
              </h1>
            </div>

            <div className="h-[2px] w-10 bg-blue-500 mt-2" />
          </div>

          <p className="text-slate-600 max-w-md">
            Warehouse & Production Management System with real-time monitoring and quality inspection flow.
          </p>

          <ul className="text-sm space-y-3 text-slate-600">
            <li className="flex items-center gap-2"><Package size={16}/> Inventory Tracking</li>
            <li className="flex items-center gap-2"><Repeat size={16}/> Incoming / Outgoing</li>
            <li className="flex items-center gap-2"><FlaskConical size={16}/> QC Monitoring</li>
            <li className="flex items-center gap-2"><BarChart size={16}/> Production Dashboard</li>
          </ul>

          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} Internal System
          </span>
        </div>

        {/* LOGIN */}
        <div className="flex items-center justify-center">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            <Card className="relative w-full max-w-md p-8 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-blue-200/40 hover:shadow-2xl transition">

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl" />

              <div className="absolute bottom-3 right-4 text-[10px] text-slate-300">
                v1.0.0
              </div>

              <div className="text-center space-y-1 mb-6">
                <p className="text-xs text-muted-foreground">
                  Shift login — {time}
                </p>

                <h2 className="text-2xl font-semibold text-slate-800">
                  Welcome Back
                </h2>

                <p className="flex items-center justify-center gap-1 text-xs text-green-600">
                  <Lock size={12}/> Secure internal authentication
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Username */}
                <div className="relative">
                  <Input
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="peer h-16 pt-8 focus:ring-2 focus:ring-blue-500"
                    placeholder=" "
                  />

                  <label className="absolute left-3 top-3 text-sm text-slate-500 transition-all
                    peer-placeholder-shown:top-5
                    peer-placeholder-shown:text-sm
                    peer-focus:top-1
                    peer-focus:text-xs
                    peer-focus:text-blue-600">
                    Employee ID / Username
                  </label>
                </div>

                {/* Password */}
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer h-16 pt-8 pr-10 focus:ring-2 focus:ring-blue-500"
                    placeholder=" "
                  />

                  <label className="absolute left-3 top-3 text-sm text-slate-500 transition-all
                    peer-placeholder-shown:top-5
                    peer-placeholder-shown:text-sm
                    peer-focus:top-1
                    peer-focus:text-xs
                    peer-focus:text-blue-600">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-5 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: [0,-6,6,-4,4,0] }}
                    className="rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  disabled={disabled}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                Manufacturing Internal Platform
              </div>

            </Card>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
