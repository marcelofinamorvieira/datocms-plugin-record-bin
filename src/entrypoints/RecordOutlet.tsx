import { RenderItemFormOutletCtx } from "datocms-plugin-sdk";
import { Button, Canvas } from "datocms-react-ui";
import { buildClient } from "@datocms/cma-client-browser";
import { useState } from "react";

const generateTrashLabel = async (ctx: RenderItemFormOutletCtx) => {
  const allFields = await ctx.loadItemTypeFields(ctx.itemType.id);
  const titleFieldAPIKey = allFields.find((field) => {
    return ctx.itemType.relationships.title_field!.data!.id === field.id;
  })!.attributes.api_key as string;
  let titleValue = ctx.formValues[titleFieldAPIKey] as any; //lazy any, fix later :)
  if (titleValue instanceof Object) {
    titleValue = titleValue[Object.keys(titleValue as Object)[0]];
  }
  const labelString =
    titleValue +
    " | " +
    ctx.itemType.attributes.name +
    " | " +
    new Date().toDateString();
  return labelString;
};

const RecordOutlet = ({ ctx }: { ctx: RenderItemFormOutletCtx }) => {
  const [isLoading, setLoading] = useState(false);
  const deletionHandler = async () => {
    setLoading(true);
    const labelString = await generateTrashLabel(ctx);

    const client = buildClient({ apiToken: ctx.currentUserAccessToken! });
    const getRecordContent = await client.items.find(ctx.item!.id, {
      nested: "true",
      version: "published",
    });
    await client.items.create({
      item_type: {
        type: "item_type",
        id: ctx.plugin.attributes.parameters.binModelID as string,
      },
      label: labelString,
      model: ctx.itemType.attributes.api_key,
      record_body: JSON.stringify(getRecordContent),
      date_of_deletion: new Date().toISOString(),
    });
    await client.items.destroy(ctx.item!.id);
    ctx.notice("Record successfully sent to Bin");
    await ctx.navigateTo("/editor/item_types/" + ctx.itemType.id + "/items");
  };
  return (
    <Canvas ctx={ctx}>
      <Button
        buttonType={isLoading ? "muted" : "primary"}
        disabled={isLoading}
        fullWidth
        onClick={deletionHandler}
      >
        Send to Bin 🗑
      </Button>
    </Canvas>
  );
};

export default RecordOutlet;
