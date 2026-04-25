"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

      login(data.accessToken, data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isActive
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isActive ? "text-primary" : isCompleted ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 mb-6 ${
                  currentStep > step.id ? "bg-primary" : "bg-gray-200"
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
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="text-gray-500 mt-1">Join CareSphere to find the perfect caregiver</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={customerData.email}
                  onChange={handleCustomerChange}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={customerData.password}
                    onChange={handleCustomerChange}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={customerData.confirmPassword}
                    onChange={handleCustomerChange}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-500 mt-1">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={customerData.firstName}
                  onChange={handleCustomerChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={customerData.lastName}
                  onChange={handleCustomerChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={customerData.phone}
                onChange={handleCustomerChange}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={customerData.dateOfBirth}
                onChange={handleCustomerChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={customerData.address}
                onChange={handleCustomerChange}
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Care Needs</h2>
              <p className="text-gray-500 mt-1">Help us understand your care requirements</p>
            </div>
            <div>
              <Label htmlFor="careType">Type of Care Needed</Label>
              <select
                id="careType"
                name="careType"
                value={customerData.careType}
                onChange={handleCustomerChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <option value="">Select care type</option>
                {CARE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="careFrequency">Care Frequency</Label>
              <select
                id="careFrequency"
                name="careFrequency"
                value={customerData.careFrequency}
                onChange={handleCustomerChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <option value="">Select frequency</option>
                {CARE_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="preferredSchedule">Preferred Schedule</Label>
              <select
                id="preferredSchedule"
                name="preferredSchedule"
                value={customerData.preferredSchedule}
                onChange={handleCustomerChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <option value="">Select preferred time</option>
                {SCHEDULES.map((schedule) => (
                  <option key={schedule} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
              <Textarea
                id="specialRequirements"
                name="specialRequirements"
                value={customerData.specialRequirements}
                onChange={handleCustomerChange}
                rows={3}
                placeholder="Any specific needs, medical conditions, or preferences..."
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
              <p className="text-gray-500 mt-1">Please confirm your details before submitting</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name</span>
                  <p className="font-medium">{customerData.firstName} {customerData.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="font-medium">{customerData.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium">{customerData.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium">{customerData.address || "Not provided"}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <span className="text-gray-500 text-sm">Care Requirements</span>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Care Type</span>
                    <p className="font-medium">{customerData.careType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency</span>
                    <p className="font-medium">{customerData.careFrequency}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Schedule</span>
                    <p className="font-medium">{customerData.preferredSchedule || "Flexible"}</p>
                  </div>
                  {customerData.specialRequirements && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Additional Notes</span>
                      <p className="font-medium">{customerData.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">Your data is secure</p>
                <p className="text-primary-600">
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
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="text-gray-500 mt-1">Join CareSphere as a caregiver</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={caregiverData.email}
                  onChange={handleCaregiverChange}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={caregiverData.password}
                    onChange={handleCaregiverChange}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={caregiverData.confirmPassword}
                    onChange={handleCaregiverChange}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-500 mt-1">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={caregiverData.firstName}
                  onChange={handleCaregiverChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={caregiverData.lastName}
                  onChange={handleCaregiverChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={caregiverData.phone}
                onChange={handleCaregiverChange}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={caregiverData.dateOfBirth}
                onChange={handleCaregiverChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={caregiverData.address}
                onChange={handleCaregiverChange}
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
            <div>
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={caregiverData.bio}
                onChange={handleCaregiverChange}
                rows={3}
                placeholder="Tell families a bit about yourself, your experience, and what makes you a great caregiver..."
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
              <p className="text-gray-500 mt-1">Share your caregiving expertise</p>
            </div>
            <div>
              <Label>Specialties</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
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
                      className={`p-3 rounded-lg border text-sm font-medium transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary-50 text-primary"
                          : "border-gray-200 hover:border-primary/50"
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
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={caregiverData.experienceYears}
                  onChange={handleCaregiverChange}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={caregiverData.hourlyRate}
                  onChange={handleCaregiverChange}
                  placeholder="25.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="certifications">Certifications (comma separated)</Label>
              <Input
                id="certifications"
                name="certifications"
                value={caregiverData.certifications}
                onChange={handleCaregiverChange}
                placeholder="CPR, First Aid, Nursing License"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Background Verification</h2>
              <p className="text-gray-500 mt-1">For the safety of families we serve</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Background Check Required</h3>
                  <p className="text-amber-700 mt-1 text-sm">
                    As a caregiver on CareSphere, you agree to undergo a comprehensive background check including identity verification, criminal history, and reference checks. This ensures the safety and trust of the families we serve.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Background Check Includes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Identity verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    National criminal record check
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Sex offender registry check
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Reference verification
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="agreeToBackgroundCheck"
                  checked={caregiverData.agreeToBackgroundCheck}
                  onChange={(e) => handleCheckboxChange("agreeToBackgroundCheck", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="agreeToBackgroundCheck" className="text-sm font-normal cursor-pointer">
                  I consent to a comprehensive background check and certify that all information provided is accurate and complete. I understand that providing false information may result in removal from the platform.
                </Label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Your Profile</h2>
              <p className="text-gray-500 mt-1">Confirm your information before going live</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {caregiverData.firstName?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{caregiverData.firstName} {caregiverData.lastName}</h3>
                  <p className="text-gray-500">{caregiverData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium">{caregiverData.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium">{caregiverData.address || "Not provided"}</p>
                </div>
              </div>
              {caregiverData.bio && (
                <div className="text-sm">
                  <span className="text-gray-500">Bio</span>
                  <p className="font-medium">{caregiverData.bio}</p>
                </div>
              )}
              <div className="border-t pt-4">
                <span className="text-gray-500 text-sm">Professional Info</span>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Experience</span>
                    <p className="font-medium">{caregiverData.experienceYears} years</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Hourly Rate</span>
                    <p className="font-medium">${caregiverData.hourlyRate}/hr</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Specialties</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caregiverData.specialties.split(",").map((s) => s.trim()).filter(Boolean).map((spec) => (
                        <span key={spec} className="px-2 py-0.5 bg-primary-100 text-primary text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  {caregiverData.certifications && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Certifications</span>
                      <p className="font-medium">{caregiverData.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Review Pending</p>
                <p className="text-amber-700">
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
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {renderStepIndicator()}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {stepErrors[currentStep] && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{stepErrors[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[320px]">
        {role === "CUSTOMER" ? renderCustomerStep() : renderCaregiverStep()}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < steps.length ? (
          <Button type="button" onClick={nextStep}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
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