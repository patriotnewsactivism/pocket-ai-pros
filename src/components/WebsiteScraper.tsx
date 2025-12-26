import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clipboard, Globe, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteScraper } from "@/hooks/useApi";
import { websiteScraperSchema, type WebsiteScraperFormValues } from "@/lib/schemas/website-scraper";

const DEFAULT_VALUES: WebsiteScraperFormValues = {
  url: "",
  maxPages: 6,
  maxDepth: 2,
  includeSubdomains: false,
  maxChars: 60000,
};

export default function WebsiteScraper() {
  const { toast } = useToast();
  const scraper = useWebsiteScraper();

  const form = useForm<WebsiteScraperFormValues>({
    resolver: zodResolver(websiteScraperSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const pages = scraper.data?.pages ?? [];
  const summary = scraper.data?.summary;
  const errors = scraper.data?.errors ?? [];

  const combinedText = useMemo(() => {
    if (!pages.length) return "";
    return pages
      .map((page) => `# ${page.title}\n${page.text}\n\nSource: ${page.url}`)
      .join("\n\n");
  }, [pages]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await scraper.mutateAsync(values);
      toast({
        title: "Scrape complete",
        description: "Website content was collected successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to scrape website";
      toast({
        title: "Scrape failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handleCopy = async () => {
    if (!combinedText) return;
    await navigator.clipboard.writeText(combinedText);
    toast({
      title: "Copied",
      description: "Scraped content copied to clipboard.",
    });
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website Scraper
            </CardTitle>
            <CardDescription>
              Pull public website content for training or research. Admin only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maxPages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max pages</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={25} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxDepth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max depth</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxChars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max characters per page</FormLabel>
                      <FormControl>
                        <Input type="number" min={1000} max={200000} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeSubdomains"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div>
                        <FormLabel>Include subdomains</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Allow crawling subdomains like help.example.com.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(DEFAULT_VALUES)}
                    disabled={scraper.isPending}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={scraper.isPending}>
                    {scraper.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      "Run scraper"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Scrape results at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Pages scraped</p>
                <p className="text-lg font-semibold">{summary?.pagesScraped ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total characters</p>
                <p className="text-lg font-semibold">{summary?.totalChars ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">
                  {summary ? `${(summary.durationMs / 1000).toFixed(1)}s` : "0s"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Errors</p>
                <p className="text-lg font-semibold">{errors.length}</p>
              </div>
            </div>
            {summary?.truncated && (
              <p className="text-sm text-muted-foreground">
                Some pages were truncated based on the max character setting.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scrape Output</CardTitle>
          <CardDescription>Review the collected pages or copy combined text.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="combined">Combined text</TabsTrigger>
            </TabsList>
            <TabsContent value="pages" className="pt-4">
              {pages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Run a scrape to see results.
                </p>
              ) : (
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div
                      key={page.url}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{page.title}</p>
                          <p className="text-sm text-muted-foreground break-all">{page.url}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {page.textLength} chars | {page.linksFound} links
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {page.text.slice(0, 240)}{page.text.length > 240 ? "..." : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="combined" className="pt-4 space-y-3">
              <Textarea
                value={combinedText}
                readOnly
                rows={10}
                placeholder="Combined scraped text will appear here."
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!combinedText}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy text
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
