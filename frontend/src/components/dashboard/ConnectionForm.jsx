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
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { toast } from "sonner";

const connectionTypes = [
  { id: 'supabase', name: 'Supabase' },
  { id: 'singlestore', name: 'SingleStore' },
];

export function ConnectionForm({ type = 'source', onSubmit, onSuccess }) {
  const [selectedType, setSelectedType] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm({
    defaultValues: {
      db_type: '',
      db_name: '',
      db_variables: {},
    },
  });

  const handleTypeChange = (value) => {
    setSelectedType(value);
    form.setValue('db_type', value);
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format the connection data
      const connectionData = {
        db_type: data.db_type,
        db_name: data.db_name,
        db_variables: {},
      };

      // Add type-specific variables
      if (data.db_type === 'supabase') {
        connectionData.db_variables = {
          url: data.url,
          api_key: data.api_key,
          database: data.database,
        };
      } else if (data.db_type === 'singlestore') {
        connectionData.db_variables = {
          host: data.host,
          port: parseInt(data.port),
          username: data.username,
          password: data.password,
          database: data.database,
        };
      }

      // Send the request to create the connection
      const response = await api.post('/databases', connectionData);
      
      toast.success('Connection created successfully');
      if (onSuccess) {
        onSuccess(response);
      }
      form.reset();
    } catch (error) {
      console.error('Failed to create connection:', error);
      toast.error(error.message || 'Failed to create connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="db_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Type</FormLabel>
              <Select onValueChange={(value) => {
                handleTypeChange(value);
                field.onChange(value);
              }}>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="db_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter connection name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'supabase' && (
          <>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Supabase project URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter API key" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter database name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'singlestore' && (
          <>
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter host" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Enter port" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter database name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : `Add ${type}`}
        </Button>
      </form>
    </Form>
  );
}
