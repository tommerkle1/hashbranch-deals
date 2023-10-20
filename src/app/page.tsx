"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Icons } from "@/components/ui/icons";

import InventoryTable from "@/components/InventoryTable";

import SignInToTelegramCard from "@/components/SignInToTelegramCard";

import { Message } from "@/types";
import MessagesTable from "@/components/MessagesTable";

export default function Home() {
  const [textAreaValue, setTextAreaValue] = useState(""); // State for Textarea value
  const [result, setResult] = useState({
    inventory: [],
  }); // State for API result
  const [loading, setLoading] = useState(false); // State for loading indicator

  const [messages, setMessages] = useState<Message[]>([]); // State for loading indicator

  const extractData = async () => {
    try {
      setLoading(true); // Set loading state to true when the request is initiated

      // Send a POST request to your backend API with textAreaValue
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: textAreaValue }), // Send the Textarea content
      });

      if (response.ok) {
        // If the request was successful, parse and set the result
        const data = await response.json();
        console.log(data);
        setResult(data);
      } else {
        // Handle errors if needed
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading state to false when the request is complete
    }
  };

  const clearInput = () => {
    // Clear the Textarea
    setTextAreaValue("");
    setResult({ inventory: [] });
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="p-8">
        <h1 className="text-2xl text-white font-thin">
          <b>hash</b>branch deal aggregator
        </h1>
      </div>
      <div className="flex mb-8">
        <SignInToTelegramCard setMessages={setMessages} />
      </div>
      <div className="h-full flex flex-row justify-center items-center ">
        <MessagesTable messages={messages} />
      </div>
      <div className="h-full flex flex-row justify-center items-center">
        <div className="flex flex-col px-8 w-1/3">
          <div className="mb-4">
            <Textarea
              rows={20}
              placeholder="Paste the WTS message here..."
              value={textAreaValue}
              onChange={handleTextAreaChange}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              className="mr-2"
              onClick={extractData}
              disabled={loading}
            >
              {loading ? (
                <div className="flex">
                  <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Extract inventory data"
              )}
            </Button>
            <Button variant="destructive" onClick={clearInput}>
              Clear input
            </Button>
          </div>
        </div>
        <div className="flex flex-1 px-8">
          <InventoryTable inventory={result.inventory} />
        </div>
      </div>
    </div>
  );
}
