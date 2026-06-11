"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  X,
  Settings,
  Wallet,
  Receipt,
  Star ,
  Download ,
  Trash2
} from "lucide-react";
import * as XLSX from "xlsx";

export default function DashboardPage() {  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStarredModalOpen, setIsStarredModalOpen] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [starredInsights, setStarredInsights] = useState<string[]>([]);
  const totalSpent = receipts.reduce(
  (sum, r) => sum + Number(r.amount || r.amt || 0),
  0
);

  const downloadExcel = () => {
  if (receipts.length === 0) {
    alert("No activities to download");
    return;
  }

const worksheet = XLSX.utils.json_to_sheet(
  receipts.map((r) => ({
    Date: new Date(r.date).toLocaleDateString("en-IN"),
    Expense: r.name,
    Amount: r.amount,
  }))
);
const totalSpent = receipts.reduce(
  (sum, r) => sum + Number(r.amount || 0),
  0
);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Activities"
  );

  XLSX.writeFile(
    workbook,
    "BVUE42_Activities.xlsx"
  );
};

const loadExpenses = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (!error && data) {
    setReceipts(data);
  }
};
  
  const deleteExpense = async (id: number) => {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  setReceipts((prev) => prev.filter((r) => r.id !== id));
};

const deleteAllExpenses = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    alert(error.message);
    return;
  }

  loadExpenses();
  setShowDeleteModal(false);
};

  // Randomized AI logic for dynamic suggestions
  const generateSuggestion = async() => {
    if (!name || !amt) {
      setAiSuggestion("Please enter a purpose and an amount.");
      return;
    }

    setAiSuggestion(" AI is thinking..."); // Loading state

    try {
      const response = await fetch("/api/ai-suggestion", { // Must match the folder name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amt, country: "India", currency: "₹" }),
      });
      
      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      setAiSuggestion("Error generating AI suggestion. Please try again.");
    }
  };
  const handleSave = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login");
    return;
  }

  const { error } = await supabase
    .from("expenses")
    .insert([
      {
        user_id: user.id,
        name,
        amount: amt,
          date: new Date().toISOString(),
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }
  
  loadExpenses();

  setName("");
  setAmt("");
  setAiSuggestion("");
  setIsModalOpen(false);
};
  
useEffect(() => {
  loadExpenses();

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  getUser();
}, []);

useEffect(() => {
  loadExpenses();
}, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 max-w-5xl mx-auto font-sans text-gray-900">
     <div className="flex justify-between items-center mb-10">

  <div className="flex items-center gap-4">
    <div
      onClick={() => setIsStarredModalOpen(true)}
      className="cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
    >
      <Star className="text-yellow-500 fill-yellow-500" />
    </div>

    <h1 className="text-xl md:text-2xl font-bold">
      {userEmail}
    </h1>
  </div>

  <Button
    variant="destructive"
    size="sm"
    onClick={() => setShowDeleteModal(true)}
  >
    <Trash2 className="w-4 h-4 mr-2" />
    Delete
  </Button>


      </div>

      <Card className="p-10 bg-gradient-to-br from-indigo-900 to-indigo-700 text-white rounded-[2rem] shadow-2xl mb-10">
        <h2 className="text-3xl font-bold mb-2">Automate Expenses</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-white text-indigo-900 px-8 py-6 rounded-2xl font-bold">
          <Upload className="mr-2" /> Log Expense
        </Button>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card className="p-6 rounded-3xl border-none shadow-sm">
          <Wallet className="mb-4 text-indigo-500"/>
          <p className="text-sm text-gray-400 uppercase">Total Spent</p>
          <h3 className="text-2xl font-bold text-red-600">₹{totalSpent.toFixed(2)}</h3>
        </Card>
        <Card className="p-6 rounded-3xl border-none shadow-sm">
          <Receipt className="mb-4 text-emerald-500"/>
          <p className="text-sm text-gray-400 uppercase">Receipts</p>
          <h3 className="text-2xl font-bold">{receipts.length}</h3>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
  <h3 className="text-lg font-bold">Activities</h3>

  <Button
    variant="outline"
    size="sm"
    onClick={downloadExcel}
  >
    <Download className="w-4 h-4 mr-2" />
    Excel
  </Button>
</div>

     <Card className="p-6 rounded-3xl border-none shadow-sm mb-10">
  {receipts.length === 0 ? (
    <p className="text-center text-gray-400 py-10">
      No activities found
    </p>
  ) : (
    receipts.map((r) => (
  <div
    key={r.id}
    className="flex justify-between items-center mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-md transition"
  >
    <div>
      <p className="font-bold text-lg">
        {r.name}
      </p>

      <p className="text-sm text-gray-500">
        {new Date(r.date).toLocaleDateString("en-IN")}
      </p>
    </div>

    <div className="flex items-center gap-4">
      <p className="font-bold text-xl text-indigo-600">
        ₹{r.amount}
      </p>

      <button
        onClick={() => deleteExpense(r.id)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
))
    
  )}
</Card>

{isStarredModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-8 w-full max-w-md rounded-3xl h-[400px] overflow-y-auto bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Saved Insights</h2>
              <X className="cursor-pointer" onClick={() => setIsStarredModalOpen(false)} />
            </div>
            {starredInsights.length === 0 ? <p className="text-gray-400">No insights saved.</p> : 
              starredInsights.map((s, i) => <div key={i} className="p-4 bg-yellow-50 rounded-2xl mb-3 text-sm border-l-4 border-yellow-400">{s}</div>)}
          </Card>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-8 w-full max-w-sm rounded-3xl bg-white">
            <div className="flex justify-between mb-6"><h2 className="text-xl font-bold">Log Transaction</h2><X className="cursor-pointer" onClick={() => setIsModalOpen(false)} /></div>
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-3" placeholder="Purpose" onChange={(e) => setName(e.target.value)} />
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-3" type="number" placeholder="Amount" onChange={(e) => setAmt(e.target.value)} />
            <Button onClick={generateSuggestion} variant="outline" className="w-full mb-4">Get AI Suggestion</Button>
                {aiSuggestion && (
                     <div className="p-4 bg-indigo-900 text-white rounded-xl mb-4 text-sm flex justify-between items-start gap-3">
                        <p className="flex-1 break-words">
                             {aiSuggestion}
                              </p>
                              
                            <Star
                             size={22}
                             className="flex-shrink-0 cursor-pointer hover:text-yellow-400"
                             onClick={() =>
                                setStarredInsights([...starredInsights, aiSuggestion])
                            }
                            />
                            </div>
                        )}
              
            <Button onClick={handleSave} className="w-full bg-indigo-900 text-white">Save Transaction</Button>
          </Card>
        </div>
      )}

{showDeleteModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
<Card className="p-6 rounded-3xl w-[350px] bg-white shadow-2xl border border-gray-200">
            <h2 className="text-lg font-bold mb-4">
        Delete All Data?
      </h2>

      <p className="text-gray-500 mb-6">
        Are you sure you want to delete
         all activities?
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShowDeleteModal(false)}
        >
          No
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={deleteAllExpenses}
        >
          Yes
        </Button>
      </div>
    </Card>
  </div>
)}

</div>
);
}