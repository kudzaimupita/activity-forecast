import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocationSearchForm } from "../LocationSearchForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof LocationSearchForm>>,
) =>
  render(
    <LocationSearchForm
      initialLocation="Zermatt"
      isLoading={false}
      onSubmit={vi.fn()}
      {...props}
    />,
  );

describe("LocationSearchForm", () => {
  it("submits trimmed input value", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderForm({ onSubmit: handleSubmit, initialLocation: "" });

    const input = screen.getByLabelText(/location/i);
    await user.clear(input);
    await user.type(input, "  Reykjavik  ");
    await user.click(screen.getByRole("button", { name: /load forecast/i }));

    expect(handleSubmit).toHaveBeenCalledWith("Reykjavik");
  });

  it("prevents submit when input is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderForm({ onSubmit: handleSubmit, initialLocation: "" });

    const input = screen.getByLabelText(/location/i);
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: /load forecast/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("disables button and shows loader state when loading", () => {
    renderForm({ isLoading: true });

    const button = screen.getByRole("button", { name: /fetching/i });
    expect(button).toBeDisabled();
  });
});

