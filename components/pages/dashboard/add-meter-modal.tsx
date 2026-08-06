'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { addMeterAction, fetchDiscos, verifyMeterWithVtPass } from '@/app/actions/meter-actions';
import { toast } from 'sonner';
import { DiscoInterface, MeterFormData } from '@/types/meter-types';

interface AddMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshMeterList: () => void;
}


export default function AddMeterModal({ isOpen, onClose, refreshMeterList }: AddMeterModalProps) {
  const [formData, setFormData] = useState<MeterFormData>({
    name: '',
    meterNumber: '',
    disco: '',
    meterType: '',
  });
  const [errors, setErrors] = useState<Partial<MeterFormData>>({});
  const [submitMeterMessage, setSubmitMeterMessage] = useState<{ error?: string, success?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discos, setDiscos] = useState<DiscoInterface[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // call fetch discos action
  useEffect(() => {
    const loadDiscos = async () => {
      try {
        const data = await fetchDiscos();
        console.log('Fetched distribution companies:', data);
        setDiscos(data.content);
      } catch (error: unknown) {
        console.log('Error fetching distribution companies:', error);
      }
    }

    loadDiscos();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<MeterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Meter name is required';
    }
    if (!formData.meterNumber.trim()) {
      newErrors.meterNumber = 'Meter number is required';
    }
    if (!formData.disco) {
      newErrors.disco = 'Please select a distribution company';
    }
    if (!formData.meterType) {
      newErrors.meterType = 'Please select a meter type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset verification when form fields change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof MeterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Reset verification if meter-related fields change
    if (['meterNumber', 'disco', 'meterType'].includes(name)) {
      setIsVerified(false);
      setCustomerName('');
    }
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMeterMessage({});

    try {
      const result = await verifyMeterWithVtPass(formData.disco, formData.meterNumber, formData.meterType);
      setCustomerName(result.customerName);
      setIsVerified(true);
      toast.success('Meter verified successfully!');
    } catch (error: unknown) {
      setSubmitMeterMessage({ error: (error as Error)?.message || 'Failed to verify meter. Please try again.' });
      toast.error((error as Error)?.message || 'Failed to verify meter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMeter = async () => {
    setIsSubmitting(true);
    setSubmitMeterMessage({});

    try {
      await addMeterAction({ ...formData, customerName });

      toast.success('Meter added successfully!');
      setSubmitMeterMessage({ success: 'Meter added successfully!' });
      setTimeout(() => {
        setSubmitMeterMessage({});
      }, 2000);

      refreshMeterList();

      // Reset state
      setFormData({ name: '', meterNumber: '', disco: '', meterType: '' });
      setIsVerified(false);
      setCustomerName('');
    } catch (error: unknown) {
      setSubmitMeterMessage({ error: (error as Error)?.message || 'Failed to add meter. Please try again.' });
      toast.error((error as Error)?.message || 'Failed to add meter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      await handleAddMeter();
    } else {
      await handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#102A2A]/55 p-4 backdrop-blur-sm sm:items-center">
      <Card className="no-scrollbar my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border-white/45 bg-[#fff9ef]/92 shadow-[0_30px_100px_rgba(16,42,42,0.28)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-border border-b">
          <h2 className="font-bold text-foreground text-2xl">Add New Meter</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-colors hover:bg-secondary"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          {/* Meter Name */}
          <div>
            <label htmlFor="name" className="block mb-2 font-semibold text-foreground text-sm">
              Meter Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Home Meter, Shop Meter"
              className={`min-h-11 w-full rounded-xl border bg-white/45 px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? 'border-destructive' : 'border-border'
                }`}
            />
            {errors.name && <p className="mt-1 text-destructive text-sm">{errors.name}</p>}
          </div>

          {/* Meter Number */}
          <div>
            <label htmlFor="meterNumber" className="block mb-2 font-semibold text-foreground text-sm">
              Meter Number
            </label>
            <input
              type="text"
              id="meterNumber"
              name="meterNumber"
              value={formData.meterNumber}
              onChange={handleInputChange}
              placeholder="Enter your meter number"
              className={`min-h-11 w-full rounded-xl border bg-white/45 px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.meterNumber ? 'border-destructive' : 'border-border'
                }`}
            />
            {errors.meterNumber && <p className="mt-1 text-destructive text-sm">{errors.meterNumber}</p>}
          </div>

          {/* Service area */}
          <div>
            <label htmlFor="disco" className="block mb-2 font-semibold text-foreground text-sm">
              Service area
            </label>
            <select
              id="disco"
              name="disco"
              value={formData.disco}
              onChange={handleInputChange}
              className={`min-h-11 w-full rounded-xl border bg-white/45 px-4 py-2 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.disco ? 'border-destructive' : 'border-border'
                }`}
            >
              <option value="">Select your service area</option>
              {discos.map((option) => (
                <option key={option.serviceID} value={option.serviceID}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.disco && <p className="mt-1 text-destructive text-sm">{errors.disco}</p>}
          </div>

          {/* meter type */}
          <div>
            <label className="block mb-2 font-semibold text-foreground text-sm">
              Meter Type
            </label>

            <div className="gap-4 grid grid-cols-2">
              {["prepaid", "postpaid"].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium text-center transition-all
                    ${formData.meterType === type
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(16,42,42,0.16)]"
                      : "border-border bg-white/35 hover:border-primary/40"
                    }`}
                >
                  <input
                    type="radio"
                    name="meterType"
                    value={type}
                    checked={formData.meterType === type}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>

            {errors.meterType && (
              <p className="pt-5 text-destructive text-sm text-center">
                {errors.meterType}
              </p>
            )}

            {submitMeterMessage.error && (
              <p className="pt-5 text-destructive text-sm text-center">
                {submitMeterMessage.error}
              </p>
            )}

            {submitMeterMessage.success && (
              <p className="pt-5 text-green-600 text-sm text-center">
                {submitMeterMessage.success}
              </p>
            )}
          </div>

          {/* Verified Customer Name */}
          {isVerified && customerName && (
            <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-950/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-semibold text-foreground">{customerName}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? (isVerified ? 'Adding...' : 'Verifying...')
                : (isVerified ? 'Add Meter' : 'Verify')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
