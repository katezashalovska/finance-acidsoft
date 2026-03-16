import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F9FB] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
      
      {/* Footer copyright */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted text-sm font-medium">
        © 2026 AcidSoft Finance. All rights reserved.
      </div>
    </div>
  );
}
