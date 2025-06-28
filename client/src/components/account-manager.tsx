import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/lib/utils";
import type { Account } from "@shared/schema";

interface AccountManagerProps {
  onClose: () => void;
}

export default function AccountManager({ onClose }: AccountManagerProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const addAccountMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiRequest("POST", "/api/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setEmail("");
      setPassword("");
      toast({
        title: "Account added",
        description: "Account has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add account.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: number) =>
      apiRequest("DELETE", `/api/accounts/${accountId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account removed",
        description: "Account has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove account.",
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    addAccountMutation.mutate({ email: email.trim(), password });
  };

  const handleDeleteAccount = (accountId: number) => {
    deleteAccountMutation.mutate(accountId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "ready":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string, lastUsed: Date | null) => {
    if (status === "active") return "Active";
    if (lastUsed) return formatTimeAgo(new Date(lastUsed));
    return "Never used";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Management</DialogTitle>
          <DialogClose onClick={onClose}>
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Account Form */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Add New Account</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="account@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <Button
                  onClick={handleAddAccount}
                  disabled={addAccountMutation.isPending}
                  className="w-full bg-youtube-red hover:bg-red-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addAccountMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts List */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">
                Existing Accounts ({accounts.length})
              </h3>
              {accounts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No accounts added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(account.status)}`}
                        />
                        <div>
                          <p className="font-medium text-sm">{account.email}</p>
                          <p className="text-xs text-gray-500">
                            {getStatusText(account.status, account.lastUsed)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        disabled={deleteAccountMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add multiple YouTube accounts for automated rotation</li>
                <li>• Accounts will be used in sequence during automation</li>
                <li>• Make sure accounts have valid YouTube access</li>
                <li>• Inactive accounts will be skipped automatically</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
