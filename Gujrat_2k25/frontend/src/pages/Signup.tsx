import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Building, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  phone_length: number;
}

// Default country codes as fallback
const defaultCountryCodes: CountryCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', phone_length: 10 },
  { code: '+1', country: 'United States', flag: '🇺🇸', phone_length: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', phone_length: 10 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', phone_length: 9 },
  { code: '+86', country: 'China', flag: '🇨🇳', phone_length: 11 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', phone_length: 10 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', phone_length: 11 },
  { code: '+33', country: 'France', flag: '🇫🇷', phone_length: 9 },
  { code: '+39', country: 'Italy', flag: '🇮🇹', phone_length: 10 },
  { code: '+34', country: 'Spain', flag: '🇪🇸', phone_length: 9 },
];

export default function Signup() {
  const navigate = useNavigate();
  const { register, getRedirectPath } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>(defaultCountryCodes);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(defaultCountryCodes[0]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userType: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch country codes on component mount
  useEffect(() => {
    fetchCountryCodes();
  }, []);

  const fetchCountryCodes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/country-codes/');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCountryCodes(data);
          // Set default country (India)
          const defaultCountry = data.find((country: CountryCode) => country.code === '+91');
          setSelectedCountry(defaultCountry || data[0]);
        } else {
          console.error('Country codes API returned non-array data:', data);
          // Keep using default country codes
        }
      } else {
        console.error('Failed to fetch country codes:', response.status);
        // Keep using default country codes
      }
    } catch (error) {
      console.error('Error fetching country codes:', error);
      // Keep using default country codes
    }
  };

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return "Phone number is required";
    
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Country code to expected length mapping
    const countryLengths: Record<string, number> = {
      '+91': 10,  // India
      '+1': 10,   // US/Canada
      '+44': 10,  // UK
      '+61': 9,   // Australia
      '+86': 11,  // China
      '+81': 10,  // Japan
      '+49': 11,  // Germany
      '+33': 9,   // France
      '+39': 10,  // Italy
      '+34': 9,   // Spain
      '+7': 10,   // Russia
      '+55': 11,  // Brazil
      '+52': 10,  // Mexico
      '+27': 9,   // South Africa
      '+971': 9,  // UAE
      '+966': 9,  // Saudi Arabia
      '+65': 8,   // Singapore
      '+60': 9,   // Malaysia
      '+66': 9,   // Thailand
      '+84': 9,   // Vietnam
    };
    
    const expectedLength = countryLengths[countryCode] || 10;
    
    if (digitsOnly.length !== expectedLength) {
      return `Phone number for ${countryCode} should be ${expectedLength} digits long`;
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate phone number in real-time
    if (name === 'phone' && selectedCountry) {
      const error = validatePhoneNumber(value, selectedCountry.code);
      setValidationErrors(prev => ({ 
        ...prev, 
        phone: error || '' 
      }));
    }
  };

  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }));
    if (validationErrors.userType) {
      setValidationErrors(prev => ({ ...prev, userType: '' }));
    }
  };

  const handleCountryChange = (value: string) => {
    const country = countryCodes.find(c => c.code === value);
    setSelectedCountry(country || null);
    
    // Re-validate phone number with new country
    if (formData.phone) {
      const error = validatePhoneNumber(formData.phone, value);
      setValidationErrors(prev => ({ 
        ...prev, 
        phone: error || '' 
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.userType) errors.userType = "Please select your user type";
    if (!formData.password) errors.password = "Password is required";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    
    // Confirm password validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    // Phone validation
    if (selectedCountry && formData.phone) {
      const phoneError = validatePhoneNumber(formData.phone, selectedCountry.code);
      if (phoneError) errors.phone = phoneError;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone, // Send only the phone number digits (backend will combine with country code)
          country_code: selectedCountry?.code || '+91',
          user_type: formData.userType,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', data.data.tokens.access);
        localStorage.setItem('refresh_token', data.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success("Account created successfully!");
        
        // Redirect based on user type
        const redirectPath = getRedirectPath(data.data.user.user_type);
        navigate(redirectPath);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          const backendErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach(key => {
            backendErrors[key] = data.errors[key][0];
          });
          setValidationErrors(backendErrors);
          toast.error("Please fix the errors in the form");
        } else {
          toast.error(data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background with floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-8 h-8 bg-gradient-primary rounded-full blur-sm opacity-60"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute top-1/3 right-1/3 w-6 h-6 bg-gradient-accent rounded-full blur-sm opacity-40"
        />
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/3 left-1/5 w-10 h-10 bg-gradient-primary rounded-full blur-sm opacity-30"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-surface border-glass-border">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-display font-bold">
                Join QuickCourt
              </CardTitle>
              <p className="text-muted-foreground">
                Create your account and start booking courts
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`pl-10 ${validationErrors.firstName ? 'border-error' : ''}`}
                        required
                      />
                    </div>
                    {validationErrors.firstName && (
                      <p className="text-xs text-error flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`pl-10 ${validationErrors.lastName ? 'border-error' : ''}`}
                        required
                      />
                    </div>
                    {validationErrors.lastName && (
                      <p className="text-xs text-error flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 ${validationErrors.email ? 'border-error' : ''}`}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-error flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex space-x-2">
                    <div className="w-1/3">
                      <Select 
                        value={selectedCountry?.code} 
                        onValueChange={handleCountryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(countryCodes) && countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center space-x-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-2/3 relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={selectedCountry ? `${selectedCountry.phone_length} digits` : "Phone number"}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 ${validationErrors.phone ? 'border-error' : ''}`}
                        maxLength={selectedCountry?.phone_length || 10}
                        required
                      />
                    </div>
                  </div>
                  {validationErrors.phone && (
                    <p className="text-xs text-error flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {validationErrors.phone}
                    </p>
                  )}
                  {selectedCountry && !validationErrors.phone && formData.phone && (
                    <p className="text-xs text-success flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid phone number for {selectedCountry.country}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">I am a</Label>
                  <Select value={formData.userType} onValueChange={handleUserTypeChange} required>
                    <SelectTrigger className={`w-full ${validationErrors.userType ? 'border-error' : ''}`}>
                      <SelectValue placeholder="Select your user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Player</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="owner">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Court Owner</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.userType && (
                    <p className="text-xs text-error flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {validationErrors.userType}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.userType === "player" && "Join matches and book courts to play"}
                    {formData.userType === "owner" && "List your courts and manage bookings"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${validationErrors.password ? 'border-error' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-error flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-error' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-error flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-glass-border bg-transparent"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary-glow transition-colors"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary-glow transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-glass-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full" disabled>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    Facebook
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary-glow transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 