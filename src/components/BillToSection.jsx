import React from 'react';
import FloatingLabelInput from './FloatingLabelInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Coins } from 'lucide-react';

const currencies = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "KES", label: "Kenyan Shilling (KSh)", symbol: "KSh" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" }
];

const BillToSection = ({ billTo, handleInputChange, selectedCurrency, setSelectedCurrency }) => {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="glass-card p-6 rounded-xl mb-6 elegant-shadow">
        <div className="flex items-center space-x-2 mb-4">
          <Coins className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Select Currency</h3>
        </div>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-full transition-smooth hover:border-primary/50">
            <SelectValue placeholder="Choose currency" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            {currencies.map((currency) => (
              <SelectItem 
                key={currency.value} 
                value={currency.value}
                className="transition-smooth hover:bg-accent/50"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="glass-card p-6 rounded-xl elegant-shadow">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Bill To
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FloatingLabelInput
              id="billToName"
              label="Name"
              value={billTo.name}
              onChange={handleInputChange}
              name="name"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <FloatingLabelInput
              id="billToPhone"
              label="Phone"
              value={billTo.phone}
              onChange={handleInputChange}
              name="phone"
            />
          </div>
        </div>
        <div className="animate-fade-in mt-4" style={{ animationDelay: '0.3s' }}>
          <FloatingLabelInput
            id="billToAddress"
            label="Address"
            value={billTo.address}
            onChange={handleInputChange}
            name="address"
          />
        </div>
      </div>
    </div>
  );
};

export default BillToSection;