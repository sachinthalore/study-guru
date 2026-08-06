import ApiError from "../utils/apiError.js";

export const getDocuments = async (userId) => {
  return await Document.find({
    uploadedBy: userId,
  }).sort({
    createdAt: -1,
  });
};

export const getDocumentById = async (id, userId) => {
  const document = await Document.findOne({
    _id: id,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};

export const updateDocument = async (id, userId, data) => {
  const document = await Document.findOneAndUpdate(
    {
      _id: id,
      uploadedBy: userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};
export const deleteDocument = async (id, userId) => {
  const document = await Document.findOneAndDelete({
    _id: id,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};
