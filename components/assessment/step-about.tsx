import * as React from 'react';
import { type AboutYouData } from '@/lib/validation/assessment-schema';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface StepAboutProps {
  data: AboutYouData;
  onChange: (data: Partial<AboutYouData>) => void;
  errors?: Record<string, string>;
}

export function StepAbout({ data, onChange, errors = {} }: StepAboutProps) {
  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">About You</CardTitle>
        <CardDescription>
          Tell us who this customized meal plan is for. Adults aged 18 and older only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* First Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-dark-text" htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="first_name"
            placeholder="e.g. Priya or Rahul"
            value={data.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
            className={errors['first_name'] ? 'border-destructive' : ''}
            autoFocus
          />
          {errors['first_name'] && (
            <p className="text-xs text-destructive">{errors['first_name']}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-dark-text" htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={errors['email'] ? 'border-destructive' : ''}
          />
          <p className="text-[11px] text-muted-text">
            We will send your review decision and private access link to this address.
          </p>
          {errors['email'] && (
            <p className="text-xs text-destructive">{errors['email']}</p>
          )}
        </div>

        {/* Phone Number (Mandatory) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-dark-text" htmlFor="phone">
            Mobile Number <span className="text-destructive">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border-soft bg-pale-green/40 text-xs font-bold text-forest-green">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={data.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              className={`rounded-l-none ${errors['phone'] ? 'border-destructive' : ''}`}
              maxLength={10}
            />
          </div>
          <p className="text-[11px] text-muted-text">
            Required for our nutrition team and clinical dietitian to connect with you for personalized diet planning.
          </p>
          {errors['phone'] && (
            <p className="text-xs text-destructive">{errors['phone']}</p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-dark-text" htmlFor="age">
            Age in Years <span className="text-destructive">*</span>
          </label>
          <Input
            id="age"
            type="number"
            min={18}
            max={100}
            value={data.age || ''}
            onChange={(e) => onChange({ age: parseInt(e.target.value, 10) || 0 })}
            className={errors['age'] ? 'border-destructive' : ''}
          />
          {data.age > 0 && data.age < 18 && (
            <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900">
              Fitvora is customized for adult nutritional requirements (18+). If you are under 18, please consult with a registered pediatric nutritionist or pediatrician.
            </div>
          )}
          {errors['age'] && (
            <p className="text-xs text-destructive">{errors['age']}</p>
          )}
        </div>

        {/* Gender Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-dark-text">
            Gender <span className="text-xs text-muted-text font-normal">(Optional, helps calibrate BMR)</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: 'female', label: 'Female' },
              { id: 'male', label: 'Male' },
              { id: 'non_binary', label: 'Non-binary' },
              { id: 'prefer_not_to_say', label: 'Prefer not to say' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ gender: option.id as AboutYouData['gender'] })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  data.gender === option.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
