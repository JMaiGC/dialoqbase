import { useState } from "react";
import { Form, notification, Skeleton } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BotForm } from "../../Common/BotForm";
import axios from "axios";
import { useCreateConfig } from "../../../hooks/useCreateConfig";

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const NewDsForm = ({ onClose }: { onClose: () => void }) => {
  const { data: botConfig, status: botConfigStatus } = useCreateConfig();
  const [selectedSource, setSelectedSource] = useState<any>({
    id: 1,
    value: "Website",
  });
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [form] = Form.useForm();
  const onSubmit = async (values: any) => {
    if (selectedSource.id == 2 || selectedSource.id == 5) {
      const formData = new FormData();
      values.file.forEach((file: any) => {
        formData.append("file", file.originFileObj);
      });
      const response = await api.post(
        `/bot/${params.id}/source/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    }
    const response = await api.post(`/bot/${params.id}/source`, {
      type: selectedSource.value.toLowerCase(),
      ...values,
    });
    return response.data;
  };

  const { mutateAsync: createBot, isLoading } = useMutation(onSubmit, {
    onSuccess: () => {
      client.invalidateQueries(["getBotDS", params.id]);
      onClose();
      notification.success({
        message: "Success",
        description: "New Source added successfully.",
      });
      form.resetFields();
    },
    onError: (e) => {
      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e?.response?.data?.error ||
          "Something went wrong.";
        notification.error({
          message: "Error",
          description: message,
        });
        return;
      }
      notification.error({
        message: "Error",
        description: "Something went wrong.",
      });
    },
  });

  if (botConfigStatus === "loading") {
    return (
      <div className="flex justify-center items-center">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  if (botConfigStatus === "error") {
    return <div>Something went wrong while fetching config</div>;
  }

  return (
    <>
      <BotForm
        botConfig={botConfig}
        showEmbeddingAndModels={false}
        form={form}
        createBot={createBot}
        isLoading={isLoading}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};
