import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const connectionTypes = [
  { id: 'supabase', name: 'Supabase' },
  { id: 'singlestore', name: 'SingleStore' },
  // Add more connection types as needed
];

export function ConnectionForm({ type = 'source', onSubmit }) {
  const [selectedType, setSelectedType] = React.useState('');
  const [fields, setFields] = React.useState([
    { key: 'name', label: 'Connection Name', type: 'text', required: true },
  ]);

  const handleTypeChange = (value) => {
    setSelectedType(value);
    // Update fields based on connection type
    const typeFields = [
      { key: 'name', label: 'Connection Name', type: 'text', required: true },
    ];

    switch (value) {
      case 'supabase':
        typeFields.push(
          { key: 'url', label: 'Project URL', type: 'text', required: true },
          { key: 'api_key', label: 'API Key', type: 'password', required: true },
          { key: 'database', label: 'Database Name', type: 'text', required: true }
        );
        break;
      case 'singlestore':
        typeFields.push(
          { key: 'host', label: 'Host', type: 'text', required: true },
          { key: 'port', label: 'Port', type: 'number', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'database', label: 'Database Name', type: 'text', required: true }
        );
        break;
    }

    setFields(typeFields);
  };

  return (
    <Form>
      <div className="space-y-4">
        <FormField>
          <FormItem>
            <FormLabel>Connection Type</FormLabel>
            <Select onValueChange={handleTypeChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {connectionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        {fields.map((field) => (
          <FormField key={field.key}>
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type={field.type}
                  placeholder={field.label}
                  required={field.required}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        ))}

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
          Add {type}
        </Button>
      </div>
    </Form>
  );
}
