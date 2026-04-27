"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartPulse, Check, ArrowRight, ArrowLeft, User, Shield, Clock, Briefcase } from "lucide-react";

type UserRole = "CUSTOMER" | "CAREGIVER";

interface CustomerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  careType: string;
  careFrequency: string;
  specialRequirements: string;
  preferredSchedule: string;
}

interface CaregiverFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  bio: string;
  specialties: string;
  experienceYears: string;
  hourlyRate: string;
  certifications: string;
  agreeToBackgroundCheck: boolean;
}

const CARE_TYPES = [
  "Elderly Care",
  "Child Care",
  "Special Needs Care",
  "Post-Surgery Care",
  "Chronic Illness Care",
  "Dementia Care",
  "Palliative Care",
  "Companionship",
];

const CARE_FREQUENCIES = [
  "One-time",
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Weekends only",
  "Live-in",
];

const SCHEDULES = [
  "Morning (8AM - 12PM)",
  "Afternoon (12PM - 5PM)",
  "Evening (5PM - 10PM)",
  "Night (10PM - 8AM)",
  "Flexible",
];

const SPECIALTIES = [
  "Elderly Care",
  "Child Care",
  "Special Needs Care",
  "Physical Therapy",
  "Medication Management",
  "Dementia Care",
  "Post-Surgery Care",
  "Meal Preparation",
  "Transportation",
  "Light Housekeeping",
  "Companionship",
  "Vital Signs Monitoring",
];

const STEPS_CUSTOMER = [
  { id: 1, title: "Account", icon: User },
  { id: 2, title: "Personal Info", icon: User },
  { id: 3, title: "Care Needs", icon: HeartPulse },
  { id: 4, title: "Review", icon: Check },
];

const STEPS_CAREGIVER = [
  { id: 1, title: "Account", icon: User },
  { id: 2, title: "Personal Info", icon: User },
  { id: 3, title: "Professional", icon: Briefcase },
  { id: 4, title: "Verification", icon: Shield },
  { id: 5, title: "Review", icon: Check },
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  const [customerData, setCustomerData] = useState<CustomerFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    careType: "",
    careFrequency: "",
    specialRequirements: "",
    preferredSchedule: "",
  });

  const [caregiverData, setCaregiverData] = useState<CaregiverFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    bio: "",
    specialties: "",
    experienceYears: "",
    hourlyRate: "",
    certifications: "",
    agreeToBackgroundCheck: false,
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "CAREGIVER") {
      setRole("CAREGIVER");
    } else {
      setRole("CUSTOMER");
    }
  }, [searchParams]);

  const steps = role === "CUSTOMER" ? STEPS_CUSTOMER : STEPS_CAREGIVER;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaregiverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCaregiverData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof CaregiverFormData, checked: boolean) => {
    setCaregiverData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const currentSpecialties = caregiverData.specialties
      ? caregiverData.specialties.split(",").map((s) => s.trim())
      : [];
    const updated = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter((s) => s !== specialty)
      : [...currentSpecialties, specialty];
    setCaregiverData((prev) => ({ ...prev, specialties: updated.join(", ") }));
  };

  const validateStep = (step: number): boolean => {
    setStepErrors({});
    const newErrors: Record<number, string> = {};

    if (role === "CUSTOMER") {
      if (step === 1) {
        if (!customerData.email || !customerData.email.includes("@")) {
          newErrors[1] = "Please enter a valid email address";
        }
        if (!customerData.password || customerData.password.length < 8) {
          newErrors[1] = "Password must be at least 8 characters";
        }
        if (customerData.password !== customerData.confirmPassword) {
          newErrors[1] = "Passwords do not match";
        }
      } else if (step === 2) {
        if (!customerData.firstName.trim()) {
          newErrors[2] = "First name is required";
        }
        if (!customerData.lastName.trim()) {
          newErrors[2] = "Last name is required";
        }
        if (!customerData.phone.trim()) {
          newErrors[2] = "Phone number is required";
        }
      } else if (step === 3) {
        if (!customerData.careType) {
          newErrors[3] = "Please select a care type";
        }
        if (!customerData.careFrequency) {
          newErrors[3] = "Please select care frequency";
        }
      }
    } else {
      if (step === 1) {
        if (!caregiverData.email || !caregiverData.email.includes("@")) {
          newErrors[1] = "Please enter a valid email address";
        }
        if (!caregiverData.password || caregiverData.password.length < 8) {
          newErrors[1] = "Password must be at least 8 characters";
        }
        if (caregiverData.password !== caregiverData.confirmPassword) {
          newErrors[1] = "Passwords do not match";
        }
      } else if (step === 2) {
        if (!caregiverData.firstName.trim()) {
          newErrors[2] = "First name is required";
        }
        if (!caregiverData.lastName.trim()) {
          newErrors[2] = "Last name is required";
        }
        if (!caregiverData.phone.trim()) {
          newErrors[2] = "Phone number is required";
        }
      } else if (step === 3) {
        if (!caregiverData.specialties.trim()) {
          newErrors[3] = "Please select at least one specialty";
        }
        if (!caregiverData.experienceYears || parseInt(caregiverData.experienceYears) < 0) {
          newErrors[3] = "Please enter valid years of experience";
        }
        if (!caregiverData.hourlyRate || parseFloat(caregiverData.hourlyRate) <= 0) {
          newErrors[3] = "Please enter a valid hourly rate";
        }
      } else if (step === 4) {
        if (!caregiverData.agreeToBackgroundCheck) {
          newErrors[4] = "You must agree to the background check to continue";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setStepErrors(newErrors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setStepErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsLoading(true);
    setError(null);

    try {
      let registrationData: Record<string, unknown> = {
        email: role === "CUSTOMER" ? customerData.email : caregiverData.email,
        password: role === "CUSTOMER" ? customerData.password : caregiverData.password,
        role,
        firstName: role === "CUSTOMER" ? customerData.firstName : caregiverData.firstName,
        lastName: role === "CUSTOMER" ? customerData.lastName : caregiverData.lastName,
        phone: role === "CUSTOMER" ? customerData.phone : caregiverData.phone,
        address: role === "CUSTOMER" ? customerData.address : caregiverData.address,
      };

      if (role === "CUSTOMER") {
        registrationData = {
          ...registrationData,
          dateOfBirth: customerData.dateOfBirth,
          careType: customerData.careType,
          careFrequency: customerData.careFrequency,
          specialRequirements: customerData.specialRequirements,
          preferredSchedule: customerData.preferredSchedule,
        };
      } else {
        registrationData = {
          ...registrationData,
          dateOfBirth: caregiverData.dateOfBirth,
          bio: caregiverData.bio,
          specialties: caregiverData.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experienceYears: parseInt(caregiverData.experienceYears),
          hourlyRate: parseFloat(caregiverData.hourlyRate),
          certifications: caregiverData.certifications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      }

      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      login(data.accessToken, data.refreshToken, data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-start justify-between mb-14 w-full relative max-w-lg mx-auto">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative z-10 ${
                isCompleted
                  ? "bg-[#0d9488] text-white"
                  : isActive
                  ? "bg-[#0d9488] text-white ring-4 ring-[#0d9488]/20"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            
            <span
              className={`text-xs mt-2 font-medium text-center px-1 whitespace-nowrap absolute top-10 ${
                isActive ? "text-[#5eead4]" : isCompleted ? "text-white/70" : "text-white/30"
              }`}
            >
              {step.title}
            </span>

            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-[50%] w-full h-0.5 ${
                  currentStep > step.id ? "bg-[#0d9488]" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCustomerStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Create Your Account</h2>
              <p className="text-white/50 font-body">Join CareSphere to find the perfect caregiver</p>
            </div>
            <div className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-white/70 text-sm font-body mb-2 block">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={customerData.email}
                  onChange={handleCustomerChange}
                  placeholder="you@example.com"
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-white/70 text-sm font-body mb-2 block">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={customerData.password}
                    onChange={handleCustomerChange}
                    placeholder="Min. 8 characters"
                    dark
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-body mb-2 block">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={customerData.confirmPassword}
                    onChange={handleCustomerChange}
                    placeholder="Confirm password"
                    dark
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Personal Information</h2>
              <p className="text-white/50 font-body">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white/70 text-sm font-body mb-2 block">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={customerData.firstName}
                  onChange={handleCustomerChange}
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white/70 text-sm font-body mb-2 block">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={customerData.lastName}
                  onChange={handleCustomerChange}
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-white/70 text-sm font-body mb-2 block">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={customerData.phone}
                onChange={handleCustomerChange}
                placeholder="(555) 123-4567"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-white/70 text-sm font-body mb-2 block">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={customerData.dateOfBirth}
                onChange={handleCustomerChange}
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-white/70 text-sm font-body mb-2 block">Address</Label>
              <Input
                id="address"
                name="address"
                value={customerData.address}
                onChange={handleCustomerChange}
                placeholder="123 Main St, City, State ZIP"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Care Needs</h2>
              <p className="text-white/50 font-body">Help us understand your care requirements</p>
            </div>
            <div>
              <Label htmlFor="careType" className="text-white/70 text-sm font-body mb-2 block">Type of Care Needed</Label>
              <select
                id="careType"
                name="careType"
                value={customerData.careType}
                onChange={handleCustomerChange}
                className="flex h-11 w-full border border-white/10 bg-white/5 px-3 py-3 text-sm text-white rounded-sm focus-visible:outline-none focus-visible:border-[#0d9488]"
              >
                <option value="" className="bg-[#0f172a] text-white/50">Select care type</option>
                {CARE_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#0f172a] text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="careFrequency" className="text-white/70 text-sm font-body mb-2 block">Care Frequency</Label>
              <select
                id="careFrequency"
                name="careFrequency"
                value={customerData.careFrequency}
                onChange={handleCustomerChange}
                className="flex h-11 w-full border border-white/10 bg-white/5 px-3 py-3 text-sm text-white rounded-sm focus-visible:outline-none focus-visible:border-[#0d9488]"
              >
                <option value="" className="bg-[#0f172a] text-white/50">Select frequency</option>
                {CARE_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq} className="bg-[#0f172a] text-white">
                    {freq}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="preferredSchedule" className="text-white/70 text-sm font-body mb-2 block">Preferred Schedule</Label>
              <select
                id="preferredSchedule"
                name="preferredSchedule"
                value={customerData.preferredSchedule}
                onChange={handleCustomerChange}
                className="flex h-11 w-full border border-white/10 bg-white/5 px-3 py-3 text-sm text-white rounded-sm focus-visible:outline-none focus-visible:border-[#0d9488]"
              >
                <option value="" className="bg-[#0f172a] text-white/50">Select preferred time</option>
                {SCHEDULES.map((schedule) => (
                  <option key={schedule} value={schedule} className="bg-[#0f172a] text-white">
                    {schedule}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="specialRequirements" className="text-white/70 text-sm font-body mb-2 block">Special Requirements or Notes</Label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                value={customerData.specialRequirements}
                onChange={handleCustomerChange}
                rows={3}
                placeholder="Any specific needs, medical conditions, or preferences..."
                className="flex w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 rounded-sm focus-visible:outline-none focus-visible:border-[#0d9488] resize-none"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Review Your Information</h2>
              <p className="text-white/50 font-body">Please confirm your details before submitting</p>
            </div>
            <div className="bg-white/5 rounded-sm p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Name</span>
                  <p className="font-body text-white mt-1">{customerData.firstName} {customerData.lastName}</p>
                </div>
                <div>
                  <span className="text-white/40">Email</span>
                  <p className="font-body text-white mt-1">{customerData.email}</p>
                </div>
                <div>
                  <span className="text-white/40">Phone</span>
                  <p className="font-body text-white mt-1">{customerData.phone}</p>
                </div>
                <div>
                  <span className="text-white/40">Address</span>
                  <p className="font-body text-white mt-1">{customerData.address || "Not provided"}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <span className="text-white/40 text-sm">Care Requirements</span>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-white/40">Care Type</span>
                    <p className="font-body text-white mt-1">{customerData.careType}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Frequency</span>
                    <p className="font-body text-white mt-1">{customerData.careFrequency}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/40">Schedule</span>
                    <p className="font-body text-white mt-1">{customerData.preferredSchedule || "Flexible"}</p>
                  </div>
                  {customerData.specialRequirements && (
                    <div className="col-span-2">
                      <span className="text-white/40">Additional Notes</span>
                      <p className="font-body text-white mt-1">{customerData.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-sm">
              <Shield className="w-5 h-5 text-[#5eead4] mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-body text-[#5eead4]">Your data is secure</p>
                <p className="text-white/50 mt-1 font-body">
                  All personal information is encrypted and stored securely. We never share your data without your consent.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCaregiverStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Create Your Account</h2>
              <p className="text-white/50 font-body">Join CareSphere as a caregiver</p>
            </div>
            <div className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-white/70 text-sm font-body mb-2 block">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={caregiverData.email}
                  onChange={handleCaregiverChange}
                  placeholder="you@example.com"
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-white/70 text-sm font-body mb-2 block">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={caregiverData.password}
                    onChange={handleCaregiverChange}
                    placeholder="Min. 8 characters"
                    dark
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-body mb-2 block">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={caregiverData.confirmPassword}
                    onChange={handleCaregiverChange}
                    placeholder="Confirm password"
                    dark
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Personal Information</h2>
              <p className="text-white/50 font-body">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white/70 text-sm font-body mb-2 block">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={caregiverData.firstName}
                  onChange={handleCaregiverChange}
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white/70 text-sm font-body mb-2 block">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={caregiverData.lastName}
                  onChange={handleCaregiverChange}
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-white/70 text-sm font-body mb-2 block">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={caregiverData.phone}
                onChange={handleCaregiverChange}
                placeholder="(555) 123-4567"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-white/70 text-sm font-body mb-2 block">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={caregiverData.dateOfBirth}
                onChange={handleCaregiverChange}
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-white/70 text-sm font-body mb-2 block">Address</Label>
              <Input
                id="address"
                name="address"
                value={caregiverData.address}
                onChange={handleCaregiverChange}
                placeholder="123 Main St, City, State ZIP"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-white/70 text-sm font-body mb-2 block">Short Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={caregiverData.bio}
                onChange={handleCaregiverChange}
                rows={3}
                placeholder="Tell families a bit about yourself..."
                className="flex w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 rounded-sm focus-visible:outline-none focus-visible:border-[#0d9488] resize-none"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Professional Details</h2>
              <p className="text-white/50 font-body">Share your caregiving expertise</p>
            </div>
            <div>
              <Label className="text-white/70 text-sm font-body mb-3 block">Specialties</Label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALTIES.map((specialty) => {
                  const isSelected = caregiverData.specialties
                    .split(",")
                    .map((s) => s.trim())
                    .includes(specialty);
                  return (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className={`p-3 rounded-sm border text-sm font-body text-left transition-all ${
                        isSelected
                          ? "border-[#0d9488] bg-[#0d9488]/10 text-[#5eead4]"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                      }`}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experienceYears" className="text-white/70 text-sm font-body mb-2 block">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={caregiverData.experienceYears}
                  onChange={handleCaregiverChange}
                  placeholder="5"
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate" className="text-white/70 text-sm font-body mb-2 block">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={caregiverData.hourlyRate}
                  onChange={handleCaregiverChange}
                  placeholder="25.00"
                  dark
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="certifications" className="text-white/70 text-sm font-body mb-2 block">Certifications (comma separated)</Label>
              <Input
                id="certifications"
                name="certifications"
                value={caregiverData.certifications}
                onChange={handleCaregiverChange}
                placeholder="CPR, First Aid, Nursing License"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-sm"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Background Verification</h2>
              <p className="text-white/50 font-body">For the safety of families we serve</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-white mb-2">Background Check Required</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    As a caregiver on CareSphere, you agree to undergo a comprehensive background check including identity verification, criminal history, and reference checks.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-sm">
                <h4 className="font-body text-white/70 text-sm mb-3">Background Check Includes:</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0d9488]" />
                    Identity verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0d9488]" />
                    National criminal record check
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0d9488]" />
                    Sex offender registry check
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0d9488]" />
                    Reference verification
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 p-4 border border-white/10 rounded-sm">
                <input
                  type="checkbox"
                  id="agreeToBackgroundCheck"
                  checked={caregiverData.agreeToBackgroundCheck}
                  onChange={(e) => handleCheckboxChange("agreeToBackgroundCheck", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#0d9488] focus:ring-[#0d9488]"
                />
                <Label htmlFor="agreeToBackgroundCheck" className="text-sm font-body text-white/60 cursor-pointer">
                  I consent to a comprehensive background check and certify that all information provided is accurate and complete.
                </Label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Review Your Profile</h2>
              <p className="text-white/50 font-body">Confirm your information before going live</p>
            </div>
            <div className="bg-white/5 rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] flex items-center justify-center text-white text-2xl font-bold">
                  {caregiverData.firstName?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-heading text-xl text-white">{caregiverData.firstName} {caregiverData.lastName}</h3>
                  <p className="text-white/40 text-sm">{caregiverData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Phone</span>
                  <p className="font-body text-white mt-1">{caregiverData.phone}</p>
                </div>
                <div>
                  <span className="text-white/40">Address</span>
                  <p className="font-body text-white mt-1">{caregiverData.address || "Not provided"}</p>
                </div>
              </div>
              {caregiverData.bio && (
                <div className="text-sm">
                  <span className="text-white/40">Bio</span>
                  <p className="font-body text-white mt-1">{caregiverData.bio}</p>
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <span className="text-white/40 text-sm">Professional Info</span>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-white/40">Experience</span>
                    <p className="font-body text-white mt-1">{caregiverData.experienceYears} years</p>
                  </div>
                  <div>
                    <span className="text-white/40">Hourly Rate</span>
                    <p className="font-body text-white mt-1">${caregiverData.hourlyRate}/hr</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/40">Specialties</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caregiverData.specialties.split(",").map((s) => s.trim()).filter(Boolean).map((spec) => (
                        <span key={spec} className="px-2 py-0.5 bg-[#0d9488]/20 text-[#5eead4] text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  {caregiverData.certifications && (
                    <div className="col-span-2">
                      <span className="text-white/40">Certifications</span>
                      <p className="font-body text-white mt-1">{caregiverData.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 bg-amber-500/10 border border-amber-500/20 rounded-sm">
              <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-body text-white">Review Pending</p>
                <p className="text-white/50 mt-1">
                  Your profile will be reviewed by our team within 24-48 hours. You will receive an email once approved.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inner-card p-8 md:p-10 w-full max-w-2xl"
        >
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-body text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 mb-6">
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}

          {stepErrors[currentStep] && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 mb-6">
              <p className="text-sm text-red-400 font-body">{stepErrors[currentStep]}</p>
            </div>
          )}

          <div className="min-h-[320px]">
            {role === "CUSTOMER" ? renderCustomerStep() : renderCaregiverStep()}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep} className="bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488]">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isLoading} className="bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488]">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-white/40 font-body">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5eead4] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="bg-[#0f172a] rounded-2xl shadow-xl p-8 animate-pulse border border-white/10">
      <div className="h-8 bg-white/10 rounded w-1/2 mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-white/10 rounded" />
        <div className="h-10 bg-white/10 rounded" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}