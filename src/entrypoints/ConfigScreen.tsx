import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, Form, SwitchField, TextField } from "datocms-react-ui";

type Props = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <h2>Delete all trashed records older than </h2>{" "}
      <Form>
        <TextField
          required
          name="numberOfDays"
          id="numberOfDays"
          label="Days"
          value="7"
          onChange={(newValue) => console.log(newValue)}
        />
        <SwitchField
          name="recurringDelete"
          id="recurringDelete"
          label="Do this on dashboard initialization"
          value={true}
          onChange={(newValue) => console.log(newValue)}
        />
        <Button fullWidth buttonType="negative">
          Delete
        </Button>
      </Form>
    </Canvas>
  );
}
