"use client";
import { type BaseSyntheticEvent, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Message } from "@/types";

import { TelegramClient } from "@hashbranch/telegram";
import { StringSession } from "@hashbranch/telegram/sessions";

interface IInitialState {
  phoneNumber: string;
  // password: string;
  phoneCode: string;
}

const initialState: IInitialState = {
  phoneNumber: "",
  // password: "",
  phoneCode: "",
};

let sessionString = "";

if (typeof window !== "undefined") {
  // Perform localStorage action
  sessionString = localStorage.getItem("sessionString") || "";
}

const SESSION = new StringSession(sessionString); //create a new StringSession, also you can use StoreSession

const API_ID = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID); // put your API id here

const API_HASH = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH; // put your API hash here

const client = new TelegramClient(SESSION, API_ID, API_HASH, {
  connectionRetries: 5,
}); // Immediately create a client using your application data

export default function SignInToTelegramCard(props: {
  setMessages: (messages: Message[]) => void;
}) {
  const { setMessages } = props;
  const [loadingStartClient, setLoadingStartClient] = useState(false); // State for loading indicator
  const [loadingInsertCode, setLoadingInsertCode] = useState(false); // State for loading indicator
  const [clientReady, setClientReady] = useState(sessionString !== ""); // State for loading indicator
  const [loadingFetchingData, setLoadingFetchingData] = useState(false); // State for loading indicator
  const channelName = "HardwareMarket";

  const [{ phoneNumber, phoneCode }, setAuthInfo] =
    useState<IInitialState>(initialState);

  async function sendCodeHandler(): Promise<void> {
    setLoadingStartClient(true);
    try {
      await client.connect(); // Connecting to the server

      await client.sendCode(
        {
          apiId: API_ID,
          apiHash: API_HASH,
        },
        phoneNumber
      );
    } catch (error) {}
    setLoadingStartClient(false);
  }

  async function clientStartHandler(): Promise<void> {
    setLoadingInsertCode(true);
    await client.start({
      phoneNumber,
      // password: userAuthParamCallback(password),
      phoneCode: userAuthParamCallback(phoneCode),
      onError: () => {},
    });
    await client.sendMessage("me", {
      message: "You're successfully logged in!",
    });

    const sessionString = client.session.save();
    //@ts-ignore
    localStorage.setItem("sessionString", sessionString);

    setLoadingInsertCode(false);
    setClientReady(true);
  }

  function inputChangeHandler({
    target: { name, value },
  }: BaseSyntheticEvent): void {
    setAuthInfo((authInfo) => ({ ...authInfo, [name]: value }));
  }

  function userAuthParamCallback<T>(param: T): () => Promise<T> {
    return async function () {
      return await new Promise<T>((resolve) => {
        resolve(param);
      });
    };
  }

  async function fetchDataHandler(): Promise<void> {
    setLoadingFetchingData(true);

    await client.connect();

    const messages = await client.getMessages(`https://t.me/${channelName}/`, {
      limit: 100,
    });

    setMessages(
      messages.map((m) => ({
        date: m.date,
        message: m.message,
        id: m.id,
        user: m.fromId,
        link: `https://t.me/${channelName}/${m.id}`,
      }))
    );

    setLoadingFetchingData(false);
  }

  return (
    <Card className="w-[700px]">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle className="mb-1">Sign in to Telegram </CardTitle>
            <CardDescription>Let's get this bot some creds...</CardDescription>
          </div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
            className="h-12 w-12"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 w-full items-center gap-4 mb-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Phone number</Label>
            <Input
              className="mb-2"
              type="tel"
              name="phoneNumber"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={inputChangeHandler}
            />
            <Button onClick={sendCodeHandler} disabled={loadingStartClient}>
              {loadingStartClient ? (
                <div className="flex">
                  <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Send code"
              )}
            </Button>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">What data do you want to scrape?</Label>

            <Select>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="asic">ASICs for sale</SelectItem>
                <SelectItem value="hosting">Hosting deals</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={fetchDataHandler}
              disabled={loadingFetchingData}
            >
              {loadingFetchingData ? (
                <div className="flex">
                  <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Grab latest data"
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Login code</Label>
            <Input
              type="text"
              name="phoneCode"
              placeholder="Phone code"
              value={phoneCode}
              onChange={inputChangeHandler}
            />
            <Button onClick={clientStartHandler} disabled={loadingInsertCode}>
              {loadingInsertCode ? (
                <div className="flex">
                  <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {clientReady ? (
          <div className="flex grow justify-center text-green-500">
            <Icons.success className="h-6 w-6 stroke-green-500 mr-1" />
            Successfully logged in
          </div>
        ) : (
          <div className="flex grow justify-center ">
            <Icons.alert className="h-6 w-6  mr-1" />
            Login to continue
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
