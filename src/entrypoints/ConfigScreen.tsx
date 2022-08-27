import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, Form, TextField } from "datocms-react-ui";
import { useState } from "react";

type Props = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
  const [numberOfDays, setNumberOfDays] = useState("7");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deletionHandler = async () => {
    const userInput = parseInt(numberOfDays);
    if (isNaN(userInput)) {
      setError("Days must be an integerer number");
      return;
    }

    setLoading(true);

    const requestBody = {
      event_type: "cleanup",
      numberOfDays: numberOfDays,
      environment: ctx.environment,
    };

    const parsedBody = JSON.stringify(requestBody);

    await fetch(ctx.plugin.attributes.parameters.vercelURL as URL, {
      method: "POST",
      body: parsedBody,
      headers: { Accept: "*/*", "Content-Type": "application/json" },
    });

    ctx.notice(
      `All records older than ${numberOfDays} days in the bin have been deleted.`
    );

    setLoading(false);
  };

  return (
    <Canvas ctx={ctx}>
      <h2>Delete all trashed records older than </h2>{" "}
      <Form>
        <TextField
          error={error}
          required
          name="numberOfDays"
          id="numberOfDays"
          label="Days"
          value={numberOfDays}
          onChange={(event) => {
            setNumberOfDays(event);
            setError("");
          }}
        />
        {/* <SwitchField
          name="recurringDelete"
          id="recurringDelete"
          label="Do this on dashboard initialization"
          value={true}
          onChange={(newValue) => console.log(newValue)}
        /> */}
        <Button
          onClick={deletionHandler}
          fullWidth
          buttonType={isLoading ? "muted" : "negative"}
        >
          Delete
        </Button>
      </Form>
    </Canvas>
  );
}
