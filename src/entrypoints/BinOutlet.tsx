import { RenderItemFormOutletCtx } from "datocms-plugin-sdk";
import { Button, Canvas } from "datocms-react-ui";
import { buildClient } from "@datocms/cma-client-browser";
import { useState } from "react";

function recursivelyDeleteAllBlockIDs(
  recursiveObject: any,
  previousKey: string
) {
  //lazy any replace later
  if (recursiveObject.hasOwnProperty("id") && previousKey !== "data") {
    delete recursiveObject["id"];
  }
  for (const key of Object.keys(recursiveObject)) {
    if (recursiveObject[key] instanceof Object) {
      recursivelyDeleteAllBlockIDs(recursiveObject[key], key);
    }
  }
}

const BinOutlet = ({ ctx }: { ctx: RenderItemFormOutletCtx }) => {
  const [isLoading, setLoading] = useState(false);
  const restorationHandler = async () => {
    setLoading(true);
    const recordObject = await JSON.parse(ctx.formValues.record_body as string);
    const tempMeta = {
      created_at: recordObject.meta.created_at,
      first_published_at: recordObject.meta.first_published_at,
    };
    const newRecordObject = {
      data: {
        type: "item",
        meta: tempMeta,
        relationships: { item_type: { data: { ...recordObject.item_type } } },
        attributes: {},
      },
    };
    delete recordObject.created_at;
    delete recordObject.updated_at;
    delete recordObject.creator;
    delete recordObject.type;
    delete recordObject.meta;
    delete recordObject.item_type;
    recursivelyDeleteAllBlockIDs(recordObject, "");

    newRecordObject.data.attributes = { ...recordObject };

    const response = await fetch("https://site-api.datocms.com/items", {
      method: "POST",
      headers: {
        "X-Api-Version": "3",
        Authorization: "Bearer " + ctx.currentUserAccessToken,
        Accept: "application/json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(newRecordObject),
    });

    const parsedResponse = await response.json();

    const client = buildClient({ apiToken: ctx.currentUserAccessToken! });

    await client.items.destroy(ctx.item!.id);
    ctx.notice("Record successfully restored!");
    await ctx.navigateTo(
      "/editor/item_types/" +
        parsedResponse.data.relationships.item_type.data.id +
        "/items/" +
        parsedResponse.data.id
    );
  };
  return (
    <Canvas ctx={ctx}>
      <Button
        buttonType={isLoading ? "muted" : "primary"}
        disabled={isLoading}
        fullWidth
        onClick={restorationHandler}
      >
        Restore record ♻️
      </Button>
    </Canvas>
  );
};

export default BinOutlet;
