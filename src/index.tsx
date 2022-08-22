import {
  connect,
  IntentCtx,
  ItemType,
  RenderItemFormOutletCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import ConfigScreen from "./entrypoints/ConfigScreen";
import "datocms-react-ui/styles.css";
import { buildClient } from "@datocms/cma-client-browser";
import RecordOutlet from "./entrypoints/RecordOutlet";
import BinOutlet from "./entrypoints/BinOutlet";

connect({
  async onBoot(ctx) {
    if (!ctx.currentUserAccessToken) {
      //warn the user he needs to give token permission or the plugin doesn't work.
      return;
    }
    if (!ctx.plugin.attributes.parameters.installed) { //creates the "Record Bin" model, and its fields.
      const client = buildClient({ apiToken: ctx.currentUserAccessToken });
      const recordBinModel = await client.itemTypes.create({
        name: "🗑 Record Bin",
        api_key: "record_bin",
        collection_appearance: "table",
      });
      const labelField = await client.fields.create("record_bin", {
        label: "Label",
        field_type: "string",
        api_key: "label",
        position: 1,
      });
      client.fields.create("record_bin", {
        label: "Model",
        field_type: "string",
        api_key: "model",
        position: 2,
      });
      client.fields.create("record_bin", {
        label: "Date of deletion",
        field_type: "date_time",
        api_key: "date_of_deletion",
        position: 3,
      });
      client.fields.create("record_bin", {
        label: "Record body",
        field_type: "json",
        api_key: "record_body",
        position: 4,
      });

      await client.itemTypes.update("record_bin", {
        title_field: { type: "field", id: labelField.id },
        collection_appearance: "table",
      });

      await ctx.updatePluginParameters({
        installed: true,
        binModelID: recordBinModel.id, //this is bad for multiple environments, fix later
      });
    }
  },
  renderConfigScreen(ctx) {
    console.log(ctx.plugin.attributes.parameters.binModelID);
    return render(<ConfigScreen ctx={ctx} />);
  },
  itemFormOutlets(model: ItemType, ctx: IntentCtx) {
    if (model.attributes.api_key === "record_bin") {
      return [
        {
          id: "binOutlet",
          initialHeight: 0,
        },
      ];
    }
    return [
      {
        id: "recordBin",
        initialHeight: 0,
      },
    ];
  },
  renderItemFormOutlet(outletId, ctx: RenderItemFormOutletCtx) {
    if (outletId === "recordBin") {
      render(<RecordOutlet ctx={ctx} />);
    } else {
      render(<BinOutlet ctx={ctx} />);
    }
  },
});
