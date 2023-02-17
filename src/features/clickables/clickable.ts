import ClickableComponent from "features/clickables/Clickable.vue";
import type {
    CoercableComponent,
    GenericComponent,
    OptionsFunc,
    Replace,
    StyleValue
} from "features/feature";
import { Component, GatherProps, getUniqueID, setDefault, Visibility } from "features/feature";
import type { BaseLayer } from "game/layers";
import type { Unsubscribe } from "nanoevents";
import type {
    Computable,
    GetComputableType,
    GetComputableTypeWithDefault,
    ProcessedComputable
} from "util/computed";
import { processComputable } from "util/computed";
import { createLazyProxy } from "util/proxies";
import { computed, unref } from "vue";

export const ClickableType = Symbol("Clickable");

export interface ClickableOptions {
    visibility?: Computable<Visibility | boolean>;
    canClick?: Computable<boolean>;
    classes?: Computable<Record<string, boolean>>;
    style?: Computable<StyleValue>;
    mark?: Computable<boolean | string>;
    display?: Computable<
        | CoercableComponent
        | {
              title?: CoercableComponent;
              description: CoercableComponent;
          }
    >;
    small?: boolean;
    onClick?: (e?: MouseEvent | TouchEvent) => void;
    onHold?: VoidFunction;
}

export interface BaseClickable {
    id: string;
    type: typeof ClickableType;
    [Component]: typeof ClickableComponent;
    [GatherProps]: () => Record<string, unknown>;
}

export type Clickable<T extends ClickableOptions> = Replace<
    T & BaseClickable,
    {
        visibility: GetComputableTypeWithDefault<T["visibility"], Visibility.Visible>;
        canClick: GetComputableTypeWithDefault<T["canClick"], true>;
        classes: GetComputableType<T["classes"]>;
        style: GetComputableType<T["style"]>;
        mark: GetComputableType<T["mark"]>;
        display: GetComputableType<T["display"]>;
    }
>;

export type GenericClickable = Replace<
    Clickable<ClickableOptions>,
    {
        visibility: ProcessedComputable<Visibility | boolean>;
        canClick: ProcessedComputable<boolean>;
    }
>;

export function createClickable<T extends ClickableOptions>(
    optionsFunc?: OptionsFunc<T, BaseClickable, GenericClickable>
): Clickable<T> {
    return createLazyProxy(() => {
        const clickable = optionsFunc?.() ?? ({} as ReturnType<NonNullable<typeof optionsFunc>>);
        clickable.id = getUniqueID("clickable-");
        clickable.type = ClickableType;
        clickable[Component] = ClickableComponent;

        processComputable(clickable as T, "visibility");
        setDefault(clickable, "visibility", Visibility.Visible);
        processComputable(clickable as T, "canClick");
        setDefault(clickable, "canClick", true);
        processComputable(clickable as T, "classes");
        processComputable(clickable as T, "style");
        processComputable(clickable as T, "mark");
        processComputable(clickable as T, "display");

        if (clickable.onClick) {
            const onClick = clickable.onClick.bind(clickable);
            clickable.onClick = function (e) {
                if (unref(clickable.canClick) !== false) {
                    onClick(e);
                }
            };
        }
        if (clickable.onHold) {
            const onHold = clickable.onHold.bind(clickable);
            clickable.onHold = function () {
                if (unref(clickable.canClick) !== false) {
                    onHold();
                }
            };
        }

        clickable[GatherProps] = function (this: GenericClickable) {
            const {
                display,
                visibility,
                style,
                classes,
                onClick,
                onHold,
                canClick,
                small,
                mark,
                id
            } = this;
            return {
                display,
                visibility,
                style: unref(style),
                classes,
                onClick,
                onHold,
                canClick,
                small,
                mark,
                id
            };
        };

        return clickable as unknown as Clickable<T>;
    });
}

export function setupAutoClick(
    layer: BaseLayer,
    clickable: GenericClickable,
    autoActive: Computable<boolean> = true
): Unsubscribe {
    const isActive: ProcessedComputable<boolean> =
        typeof autoActive === "function" ? computed(autoActive) : autoActive;
    return layer.on("update", () => {
        if (unref(isActive) && unref(clickable.canClick)) {
            clickable.onClick?.();
        }
    });
}
