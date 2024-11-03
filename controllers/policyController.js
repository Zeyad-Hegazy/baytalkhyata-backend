const Policy = require("../models/PolicyModel");
const ApiError = require("../util/ApiError");

exports.createPolicy = async (req, res, next) => {
	try {
		const { title, content } = req.body;
		const policy = await Policy.create({ title, content });
		return res.status(201).json({
			status: "success",
			result: policy,
			success: true,
			message: "Policy added successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getPolicies = async (req, res, next) => {
	try {
		const policies = await Policy.find().select("title content");
		return res.status(200).json({
			status: "success",
			result: policies,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getPolicy = async (req, res, next) => {
	try {
		const { policyId } = req.params;
		const policy = await Policy.findById(policyId);
		if (!policy) return res.status(404).json({ message: "Policy not found" });
		return res.status(200).json({
			status: "success",
			result: policy,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.updatePolicy = async (req, res, next) => {
	try {
		const { policyId } = req.params;

		const policy = await Policy.findByIdAndUpdate(policyId, req.body, {
			new: true,
			runValidators: true,
		});
		if (!policy) return res.status(404).json({ message: "Policy not found" });

		return res.status(200).json({
			status: "success",
			result: policy,
			success: true,
			message: "Policy updated successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.deletePolicy = async (req, res, next) => {
	try {
		const { policyId } = req.params;
		const policy = await Policy.findByIdAndDelete(policyId);
		if (!policy) return res.status(404).json({ message: "Policy not found" });
		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "Policy deleted successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};
