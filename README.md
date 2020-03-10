# Fortellis Spec Tools

> Fortellis Spec Tools is currently in _beta_ and under development. Please report any issues found on GitHub following the issue template for _bug_.

## Using Spec Tools

Fortellis Spec Tools currently exposes two commands to help working with Fortellis API specifications: "Validate" and "Preview".

### Validate

The validate command allows you to run the Fortellis spec validator on any `.yaml` document to get in-editor errors and warnings. Validate is run automatically when a `.yaml` document is changed or saved so you don't need to use the command manually. However you can modify this behavior in the configuration, documented below.

#### Viewing Validation Notices

When the extension validates your API spec it will highlight errors inline with a red squiggley underline. You can hover over these to view the notice description in a tooltip. You can also view validation notices in the activity bar under the "Fortellis Spec" tab denoted by the Fortellis icon.

### Preview

The preview command allows you to view a mock-up of what your spec's API documentation will look like on <https://apidocs.fortellis.io/> once your spec has been published. The preview is live updating so you can keep it open to see your work as you go.

## Configuration

You can configure how Fortellis Spec Tools validates specifications. You can change these configuration values by clicking "Code" in the top left, going to Preferences > Settings and searching "Fortellis" in the "Search Settings" input.

![configuration example](/media/configuration.png)

| Property   | Type    | Description                                               | Default |
| ---------- | ------- | --------------------------------------------------------- | ------- |
| `onChange` | boolean | Toggles validation for YAML documents on document change. | `true`  |
| `onSave`   | boolean | Toggles validation for YAML documents on save.            | `true`  |
