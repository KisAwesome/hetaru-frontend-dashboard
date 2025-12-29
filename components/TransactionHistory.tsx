"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";

interface Transaction {
  id: string;
  serviceName?: string;

  cost?: number;            // USAGE
  creditsAdded?: number;    // DEPOSIT
  type?: "DEPOSIT" | "USAGE";

  status: "PENDING" | "COMPLETED" | "FAILED";

  timestamp?: Timestamp | { seconds: number };

  // any extra stuff you store
  inputSummary?: any;
  outputSummary?: any;
  errorMessage?: string;
  serviceId?: string;
}

const PAGE_SIZE = 10;

function formatTs(ts?: Transaction["timestamp"]) {
  if (!ts) return "Just now";
  // Firestore Timestamp
  // @ts-ignore
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  // Fallback object with seconds
  // @ts-ignore
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000).toLocaleString();
  return "Just now";
}

function amountFor(tx: Transaction) {
  const isDeposit = tx.type === "DEPOSIT";
  const isFailed = tx.status === "FAILED";

  if (isFailed) return { label: "—", tone: "muted" as const };

  if (isDeposit) {
    const amt = Number(tx.creditsAdded ?? 0);
    return { label: `+${amt}`, tone: "good" as const };
  }

  const cost = Number(tx.cost ?? 0);
  return { label: `-${cost}`, tone: "bad" as const };
}

function StatusPill({ status }: { status: Transaction["status"] }) {
  if (status === "PENDING") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    );
  }
  if (status === "FAILED") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Completed
    </Badge>
  );
}

function StatusIcon({ status }: { status: Transaction["status"] }) {
  if (status === "PENDING") {
    return (
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  if (status === "FAILED") {
    return (
      <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
        <XCircle className="h-5 w-5 text-destructive" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <CheckCircle2 className="h-5 w-5 text-primary" />
    </div>
  );
}

function prettyJson(value: any) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function TransactionHistory({ user }: { user: User }) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const [selected, setSelected] = useState<Transaction | null>(null);

  const baseQuery = useMemo(() => {
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
  }, [user.uid]);

  const fetchFirstPage = async () => {
    setLoading(true);
    try {
      const q = query(baseQuery, limit(PAGE_SIZE));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Transaction[];
      setItems(data);

      const last = snap.docs[snap.docs.length - 1] ?? null;
      setCursor(last);

      // If we got less than page size, no more pages
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!hasMore || loadingMore) return;
    if (!cursor) return;

    setLoadingMore(true);
    try {
      const q = query(baseQuery, startAfter(cursor), limit(PAGE_SIZE));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Transaction[];
      setItems((prev) => [...prev, ...data]);

      const last = snap.docs[snap.docs.length - 1] ?? null;
      setCursor(last);

      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading history...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="text-sm text-muted-foreground">No transactions yet.</div>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {items.map((tx) => {
          const amt = amountFor(tx);
          const amountClass =
            amt.tone === "good"
              ? "text-emerald-500"
              : amt.tone === "bad"
              ? "text-red-500"
              : "text-muted-foreground";

          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => setSelected(tx)}
              className="w-full text-left flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <StatusIcon status={tx.status} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {tx.serviceName || (tx.type === "DEPOSIT" ? "Credit Purchase" : "Service Usage")}
                    </p>
                    <StatusPill status={tx.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{formatTs(tx.timestamp)}</p>
                </div>
              </div>

              <div className={`font-mono font-semibold ${amountClass}`}>{amt.label}</div>
            </button>
          );
        })}
      </div>

      {/* Load More */}
      <div className="px-6 py-4 border-t border-border flex justify-center">
        {hasMore ? (
          <Button variant="outline" onClick={fetchMore} disabled={loadingMore} className="gap-2 bg-transparent">
            <ChevronDown className="h-4 w-4" />
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">You’re all caught up.</div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selected?.serviceName || selected?.type || "Transaction"} • {selected ? formatTs(selected.timestamp) : ""}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <StatusPill status={selected.status} />
                <Badge variant="secondary">{selected.type || "UNKNOWN"}</Badge>
                <Badge variant="outline" className="font-mono">
                  {selected.id}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Credits</div>
                  <div className="font-mono text-lg">
                    {amountFor(selected).label}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Service</div>
                  <div className="text-sm font-medium">
                    {selected.serviceName || "—"}
                  </div>
                </div>
              </div>

              {selected.errorMessage && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <div className="text-sm font-medium text-destructive">Error</div>
                  <div className="text-sm text-destructive/90 mt-1">{selected.errorMessage}</div>
                </div>
              )}

              {/* Extra payloads */}
              {(selected.inputSummary || selected.outputSummary) && (
                <div className="grid grid-cols-1 gap-3">
                  {selected.inputSummary && (
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground mb-2">Input Summary</div>
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono text-foreground/90">
                        {prettyJson(selected.inputSummary)}
                      </pre>
                    </div>
                  )}

                  {selected.outputSummary && (
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground mb-2">Output Summary</div>
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono text-foreground/90">
                        {prettyJson(selected.outputSummary)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
