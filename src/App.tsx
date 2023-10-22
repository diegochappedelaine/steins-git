import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FormSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  time: z.string({
    required_error: 'A time is required.',
  }),
  message: z.string({
    required_error: 'A commit message is required.',
  }),
});

const generateCommitMessage = (data: z.infer<typeof FormSchema>) => {
  const date = format(data.date, 'yyyy-MM-dd');
  const time = data.time;
  const message = data.message;

  return `git commit --date="${date}T${time}Z" -m "${message}"`;
};

const App = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();
  const [commitMessage, setCommitMessage] = useState<string>('');

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const commitMessage = generateCommitMessage(data);
    setCommitMessage(commitMessage);
    await copy(commitMessage);
    toast({
      title: 'Commit message has been copied to your clipboard !',
    });
  };

  return (
    <div className="container flex flex-col max-w-xl pt-10">
      <a href="/">
        <h1 className="text-3xl font-black text-center mb-6">Steins Git</h1>
      </a>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of commit</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date you want your commit to be made.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time of commit</FormLabel>
                <Input {...field} type="time" />
                <FormDescription>
                  The time you want your commit to be made.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commit message</FormLabel>
                <Input {...field} />
                <FormDescription>
                  The message you want your commit to have.
                </FormDescription>
              </FormItem>
            )}
          />
          <Button disabled={!form.formState.isValid} type="submit">
            Generate
          </Button>
          {!!commitMessage.length && (
            <Alert>
              <AlertTitle className="mb-4">
                Your time travel commit command :
              </AlertTitle>
              <AlertDescription>
                <button
                  onClick={() => void copy(commitMessage)}
                  className="text-left bg-slate-900 p-2 rounded-md"
                >
                  {commitMessage}
                </button>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  );
};

export default App;
