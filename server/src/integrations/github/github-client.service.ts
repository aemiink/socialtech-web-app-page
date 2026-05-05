import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

@Injectable()
export class GithubClientService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly configService: ConfigService) {}

  async getRepository(owner: string, repo: string, token?: string | null) {
    return this.request(`/repos/${owner}/${repo}`, undefined, token);
  }

  async getBranches(
    owner: string,
    repo: string,
    query: Record<string, string | number | boolean | undefined>,
    token?: string | null,
  ) {
    return this.request(
      `/repos/${owner}/${repo}/branches`,
      query,
      token,
      this.cacheKey(owner, repo, "branches", query),
      120_000,
    );
  }

  async getCommits(
    owner: string,
    repo: string,
    query: Record<string, string | number | boolean | undefined>,
    token?: string | null,
  ) {
    return this.request(
      `/repos/${owner}/${repo}/commits`,
      query,
      token,
      this.cacheKey(owner, repo, "commits", query),
      60_000,
    );
  }

  async getPulls(
    owner: string,
    repo: string,
    query: Record<string, string | number | boolean | undefined>,
    token?: string | null,
  ) {
    return this.request(
      `/repos/${owner}/${repo}/pulls`,
      query,
      token,
      this.cacheKey(owner, repo, "pulls", query),
      60_000,
    );
  }

  async getWorkflowRuns(
    owner: string,
    repo: string,
    query: Record<string, string | number | boolean | undefined>,
    token?: string | null,
  ) {
    return this.request(
      `/repos/${owner}/${repo}/actions/runs`,
      query,
      token,
      this.cacheKey(owner, repo, "workflowRuns", query),
      60_000,
    );
  }

  private async request(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    token?: string | null,
    cacheKey?: string,
    ttlMs?: number,
  ) {
    if (cacheKey && ttlMs) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    const baseUrl = this.configService.get<string>("GITHUB_API_BASE_URL") ?? "https://api.github.com";
    const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new BadGatewayException(
        `GitHub API request failed with status ${response.status}. ${body.slice(0, 180)}`,
      );
    }

    const data = (await response.json()) as unknown;
    if (cacheKey && ttlMs) {
      this.cache.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
    }

    return data;
  }

  private cacheKey(
    owner: string,
    repo: string,
    resource: string,
    query?: Record<string, string | number | boolean | undefined>,
  ) {
    return `${owner}/${repo}:${resource}:${JSON.stringify(query ?? {})}`;
  }
}
