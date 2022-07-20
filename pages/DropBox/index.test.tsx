import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import '@testing-library/jest-dom'

import DropBox from "./index";

jest.mock("../../lib/axios", () => ({
  post: jest.fn().mockResolvedValue({
    data: [{ status: true, url: "https://www.google.com" }],
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe("<DropBox/>", () => {
  it("should drop", async () => {
    const { container, getByLabelText, getByText, getByAltText } = render(
      <DropBox />
    );

    const file = new File(["www.test.com"], "test.csv", { type: "text/csv" });
    const inputEl = screen.getByTestId("drop-input");
    Object.defineProperty(inputEl, "files", {
      value: [file],
    });

    act(() => {
      fireEvent.drop(inputEl);
    });

    
    await waitFor(() =>
      screen.getAllByText("UP")
    );

    expect(getByText("Total 1 Websites")).toBeVisible()
  });
});
